from rest_framework import routers
from django.urls import path, include
from .views import UserViewSet, AddressViewSet
from .views import AddressViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'addresses', AddressViewSet, basename='address')


urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.profile_view, name='profile'),
    path('profile/stats/', views.profile_stats, name='profile-stats'),
    path('profile/order-summary/', views.user_order_summary, name='user-order-summary'),
    path('profile/preferences/', views.update_user_preferences, name='update-preferences'),
    
    # Security URLs
    path('change-password/', views.change_password, name='change-password'),
]
