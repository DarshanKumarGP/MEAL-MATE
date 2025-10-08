from rest_framework import viewsets, filters
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

    # --- FIXED ANALYTICS METHOD ---
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        restaurant = self.get_object()

        # Total orders
        total_orders = restaurant.orders.count()

        # Orders this week
        current_week = datetime.now().isocalendar()[1]
        orders_this_week = restaurant.orders.filter(created_at__week=current_week).count()

        # Orders this month
        current_month = datetime.now().month
        orders_this_month = restaurant.orders.filter(created_at__month=current_month).count()

        # Average rating
        average_rating = restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0

        # Total reviews
        total_reviews = restaurant.reviews.count()

        # Revenue this month
        revenue_this_month = restaurant.orders.filter(created_at__month=current_month).aggregate(total=Sum('total_amount'))['total'] or 0

        # Popular items (top 5)
        popular_items = restaurant.menu_items.annotate(order_count=Count('order_items')).order_by('-order_count')[:5]
        popular_items_data = [
            {
                "name": item.name,
                "category__name": item.category.name if item.category else "",
                "order_count": item.order_count
            }
            for item in popular_items
        ]

        # Daily orders (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=6)
        daily_orders_qs = restaurant.orders.filter(created_at__date__gte=seven_days_ago).values('created_at')
        daily_orders_count = {}
        for order in daily_orders_qs:
            date_str = order['created_at'].date().isoformat()
            daily_orders_count[date_str] = daily_orders_count.get(date_str, 0) + 1

        # Fill missing days with 0 orders
        daily_orders = []
        for i in range(7):
            day = (seven_days_ago + timedelta(days=i)).date()
            daily_orders.append({
                "date": day.isoformat(),
                "orders": daily_orders_count.get(day.isoformat(), 0)
            })

        return Response({
            "total_orders": total_orders,
            "orders_this_week": orders_this_week,
            "orders_this_month": orders_this_month,
            "average_rating": round(average_rating, 1),
            "total_reviews": total_reviews,
            "revenue_this_month": revenue_this_month,
            "popular_items": popular_items_data,
            "daily_orders": daily_orders
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
        restaurant = self.get_object()
        now = timezone.now()
        delivered = restaurant.orders.filter(status='DELIVERED')

        total_orders = delivered.count()
        orders_this_week = delivered.filter(created_at__gte=now - timedelta(days=7)).count()
        orders_this_month = delivered.filter(
            created_at__year=now.year, created_at__month=now.month
        ).count()

        average_rating = restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        total_reviews = restaurant.reviews.count()
        revenue_this_month = delivered.filter(
            created_at__year=now.year, created_at__month=now.month
        ).aggregate(total=Sum('total_amount'))['total'] or 0

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

        daily = []
        for i in range(7):
            day = (now - timedelta(days=i)).date()
            count = delivered.filter(created_at__date=day).count()
            daily.append({'date': day.isoformat(), 'orders': count})
        daily.reverse()

        return Response({
            'total_orders': total_orders,
            'orders_this_week': orders_this_week,
            'orders_this_month': orders_this_month,
            'average_rating': round(average_rating, 1),
            'total_reviews': total_reviews,
            'revenue_this_month': float(revenue_this_month),
            'popular_items': popular_items,
            'daily_orders': daily
        })
