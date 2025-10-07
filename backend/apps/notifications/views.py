from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, OrderStatusUpdate
from .serializers import NotificationSerializer, OrderStatusUpdateSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications only for the current user"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set user to current user when creating notification"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for current user"""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})

class OrderStatusUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return order updates only for the current user"""
        return OrderStatusUpdate.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set user to current user when creating order update"""
        serializer.save(user=self.request.user)
