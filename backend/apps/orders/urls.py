from rest_framework import routers
from django.urls import path, include
from .views import CartViewSet, CartItemViewSet, OrderViewSet, OrderItemViewSet, OrderStatusHistoryViewSet, ReviewViewSet

router = routers.DefaultRouter()
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')
router.register(r'order-status', OrderStatusHistoryViewSet, basename='orderstatushistory')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
