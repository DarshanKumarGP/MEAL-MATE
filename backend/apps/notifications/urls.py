from rest_framework import routers
from django.urls import path, include
from .views import NotificationViewSet, OrderStatusUpdateViewSet

router = routers.DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'order-updates', OrderStatusUpdateViewSet, basename='orderstatusupdate')

urlpatterns = [
    path('', include(router.urls)),
]
