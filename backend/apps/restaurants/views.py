from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import timedelta
import django_filters

from .models import Restaurant, MenuCategory, MenuItem, RestaurantHours
from .serializers import (
    RestaurantSerializer,
    MenuCategorySerializer,
    MenuItemSerializer,
    RestaurantHoursSerializer
)
from apps.orders.models import OrderItem, Review

# Only import if the permissions file exists, otherwise remove this line
# from apps.core.permissions import IsRestaurantOwner

# ----- ADVANCED FILTERS FOR RESTAURANTS -----
class RestaurantFilter(django_filters.FilterSet):
    min_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='gte')
    max_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='lte')
    min_delivery_fee = django_filters.NumberFilter(field_name='delivery_fee', lookup_expr='gte')
    max_delivery_fee = django_filters.NumberFilter(field_name='delivery_fee', lookup_expr='lte')
    cuisine_type = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    is_featured = django_filters.BooleanFilter()

    class Meta:
        model = Restaurant
        fields = ['cuisine_type', 'city', 'is_featured', 'status']

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RestaurantFilter
    search_fields = ['name', 'description', 'cuisine_type', 'city', 'menu_items__name']
    ordering_fields = ['average_rating', 'delivery_fee', 'created_at', 'total_orders']
    ordering = ['-is_featured', '-average_rating']

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured = self.filter_queryset(self.get_queryset()).filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        trending = self.filter_queryset(self.get_queryset()).order_by('-total_orders')[:8]
        serializer = self.get_serializer(trending, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Analytics endpoint that works with your current setup.
        Uses the second (working) analytics method from your file.
        """
        restaurant = self.get_object()
        now = timezone.now()
        
        try:
            delivered = restaurant.orders.filter(status='DELIVERED')
        except:
            # Fallback if orders relationship doesn't exist
            delivered = restaurant.orders.all() if hasattr(restaurant, 'orders') else []

        total_orders = delivered.count() if delivered else 0
        orders_this_week = delivered.filter(created_at__gte=now - timedelta(days=7)).count() if delivered else 0
        orders_this_month = delivered.filter(
            created_at__year=now.year, created_at__month=now.month
        ).count() if delivered else 0

        # Safe ratings handling
        try:
            average_rating = restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
            total_reviews = restaurant.reviews.count()
        except:
            average_rating = 0
            total_reviews = 0

        # Safe revenue calculation
        try:
            revenue_this_month = delivered.filter(
                created_at__year=now.year, created_at__month=now.month
            ).aggregate(total=Sum('total_amount'))['total'] or 0 if delivered else 0
        except:
            revenue_this_month = 0

        # Safe popular items query
        try:
            popular_qs = OrderItem.objects.filter(
                order__restaurant=restaurant
            ).values(
                'menu_item__name', 'menu_item__category__name'
            ).annotate(order_count=Sum('quantity')).order_by('-order_count')[:5]
            popular_items = [
                {
                    'name': pi['menu_item__name'],
                    'category__name': pi['menu_item__category__name'],
                    'order_count': pi['order_count']
                } for pi in popular_qs
            ]
        except:
            popular_items = []

        # Safe daily orders
        try:
            daily = []
            for i in range(7):
                day = (now - timedelta(days=i)).date()
                count = delivered.filter(created_at__date=day).count() if delivered else 0
                daily.append({'date': day.isoformat(), 'orders': count})
            daily.reverse()
        except:
            daily = [{'date': (now - timedelta(days=i)).date().isoformat(), 'orders': 0} for i in range(7)]

        return Response({
            'total_orders': total_orders,
            'orders_this_week': orders_this_week,
            'orders_this_month': orders_this_month,
            'average_rating': round(float(average_rating), 1),
            'total_reviews': total_reviews,
            'revenue_this_month': float(revenue_this_month),
            'popular_items': popular_items,
            'daily_orders': daily
        })

    @action(detail=True, methods=['get'])
    def menu(self, request, pk=None):
        """Get restaurant menu with categories for RestaurantDetail page"""
        restaurant = self.get_object()
        
        try:
            categories = MenuCategory.objects.filter(restaurant=restaurant)
            menu_data = []
            for category in categories:
                items = MenuItem.objects.filter(category=category, is_available=True)
                menu_data.append({
                    'id': category.id,
                    'name': category.name,
                    'description': category.description,
                    'items': MenuItemSerializer(items, many=True).data
                })
            return Response(menu_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get restaurant reviews for RestaurantDetail page"""
        restaurant = self.get_object()
        
        try:
            reviews = Review.objects.filter(restaurant=restaurant).order_by('-created_at')
            
            # Simple review serialization (adjust if you have ReviewSerializer)
            reviews_data = []
            for review in reviews:
                reviews_data.append({
                    'id': review.id,
                    'customer': {
                        'first_name': review.customer.first_name,
                        'last_name': review.customer.last_name
                    },
                    'rating': review.rating,
                    'comment': review.comment,
                    'created_at': review.created_at.isoformat()
                })
            
            return Response({
                'results': reviews_data,
                'average_rating': restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0,
                'total_reviews': reviews.count()
            })
        except Exception as e:
            # Return empty if Review model doesn't exist yet
            return Response({
                'results': [],
                'average_rating': 0,
                'total_reviews': 0
            })

class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class RestaurantHoursViewSet(viewsets.ModelViewSet):
    queryset = RestaurantHours.objects.all()
    serializer_class = RestaurantHoursSerializer
    permission_classes = [IsAuthenticated]
