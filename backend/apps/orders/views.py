from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError  # Add this import
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory, Review
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer, OrderStatusHistorySerializer, ReviewSerializer

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return cart only for the current user"""
        return Cart.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set user to current user when creating cart"""
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return cart items only for the current user's carts"""
        return CartItem.objects.filter(cart__user=self.request.user)
    
    def perform_create(self, serializer):
        """Find or create user's cart and set unit_price from menu item"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        menu_item = serializer.validated_data['menu_item']
        
        existing_item = CartItem.objects.filter(
            cart=cart,
            menu_item=menu_item
        ).first()
        
        if existing_item:
            existing_item.quantity += serializer.validated_data.get('quantity', 1)
            existing_item.save()
            serializer.instance = existing_item
        else:
            serializer.save(
                cart=cart,
                unit_price=menu_item.price
            )

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        # Get user's cart items to determine restaurant
        cart_items = CartItem.objects.filter(cart__user=self.request.user)
        if not cart_items.exists():
            raise ValidationError({"detail": "No items in cart"})

        restaurant = cart_items.first().menu_item.restaurant
        
        # Generate unique order number
        import random
        import string
        order_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        serializer.save(
            customer=self.request.user,
            restaurant=restaurant,
            order_number=order_number
        )

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current user's orders"""
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return order items only for the current user's orders"""
        user_orders = Order.objects.filter(customer=self.request.user)
        return OrderItem.objects.filter(order__in=user_orders)

class OrderStatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderStatusHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return status history only for the current user's orders"""
        user_orders = Order.objects.filter(customer=self.request.user)
        return OrderStatusHistory.objects.filter(order__in=user_orders)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return reviews only for the current user"""
        return Review.objects.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        """Set customer to current user when creating review"""
        serializer.save(customer=self.request.user)
