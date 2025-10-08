from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Address
from .serializers import AddressSerializer
from .models import User, Address
from .serializers import UserSerializer, AddressSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, update_session_auth_hash
from django.db.models import Count, Sum, Q
from apps.orders.models import Order
from rest_framework import status

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return addresses only for the current user"""
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set user to current user when creating address"""
        serializer.save(user=self.request.user)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET', 'PATCH', 'DELETE'])
def profile_view(request):
    """
    Handle user profile operations - GET, UPDATE, DELETE
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    if request.method == 'GET':
        # Get current user profile
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        # Update user profile
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        # Delete user account
        try:
            request.user.delete()
            return Response({'message': 'Account deleted successfully'}, status=200)
        except Exception as e:
            return Response({'error': 'Failed to delete account'}, status=500)

@api_view(['GET'])
def profile_stats(request):
    """
    Get user profile statistics - orders, spending, favorite cuisine
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    user = request.user
    
    # Get delivered orders for statistics
    delivered_orders = Order.objects.filter(customer=user, status='DELIVERED')
    all_orders = Order.objects.filter(customer=user)
    
    # Calculate total spent
    total_spent = delivered_orders.aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Get favorite cuisine
    favorite_cuisine = ''
    cuisine_stats = delivered_orders.values(
        'restaurant__cuisine_type'
    ).annotate(
        count=Count('id')
    ).order_by('-count').first()
    
    if cuisine_stats:
        favorite_cuisine = cuisine_stats['restaurant__cuisine_type']
    
    # Calculate additional stats
    pending_orders = all_orders.filter(
        status__in=['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
    ).count()
    
    stats = {
        'total_orders': all_orders.count(),
        'delivered_orders': delivered_orders.count(),
        'pending_orders': pending_orders,
        'total_spent': str(total_spent),
        'favorite_cuisine': favorite_cuisine,
        'member_since': user.date_joined.strftime('%B %Y'),
        'average_order_value': str(round(float(total_spent) / max(delivered_orders.count(), 1), 2)),
        'last_order_date': delivered_orders.last().created_at.strftime('%B %d, %Y') if delivered_orders.exists() else None
    }
    
    return Response(stats)

@api_view(['POST'])
def change_password(request):
    """
    Change user password with current password verification
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({
            'detail': 'Both current and new passwords are required'
        }, status=400)
    
    # Verify current password
    if not authenticate(username=request.user.email, password=current_password):
        return Response({
            'detail': 'Current password is incorrect'
        }, status=400)
    
    # Validate new password length
    if len(new_password) < 8:
        return Response({
            'detail': 'New password must be at least 8 characters long'
        }, status=400)
    
    try:
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        # Keep user logged in after password change
        update_session_auth_hash(request, request.user)
        
        return Response({'message': 'Password changed successfully'})
    except Exception as e:
        return Response({
            'detail': 'Failed to change password'
        }, status=500)

@api_view(['GET'])
def user_order_summary(request):
    """
    Get detailed order summary for user dashboard
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    user = request.user
    orders = Order.objects.filter(customer=user)
    
    # Monthly spending data (last 6 months)
    from datetime import datetime, timedelta
    from django.utils import timezone
    
    monthly_data = []
    for i in range(6):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=31)
        
        month_orders = orders.filter(
            created_at__gte=month_start,
            created_at__lt=month_end,
            status='DELIVERED'
        )
        
        monthly_data.append({
            'month': month_start.strftime('%B'),
            'orders': month_orders.count(),
            'spent': str(month_orders.aggregate(Sum('total_amount'))['total'] or 0)
        })
    
    # Recent orders
    recent_orders = orders.order_by('-created_at')[:5].values(
        'id', 'order_number', 'restaurant__name', 'total_amount', 
        'status', 'created_at'
    )
    
    return Response({
        'monthly_data': list(reversed(monthly_data)),
        'recent_orders': list(recent_orders)
    })

@api_view(['POST'])
def update_user_preferences(request):
    """
    Update user notification and app preferences
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    try:
        # You can extend User model or create a UserPreferences model
        # For now, we'll store in user profile or session
        preferences = request.data.get('preferences', {})
        
        # Store preferences logic here
        # This is where you'd save to a UserPreferences model
        
        return Response({'message': 'Preferences updated successfully'})
    except Exception as e:
        return Response({'error': 'Failed to update preferences'}, status=500)