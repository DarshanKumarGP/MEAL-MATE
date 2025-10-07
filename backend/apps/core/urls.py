from rest_framework import routers
from django.urls import path, include
from .views import UserViewSet, AddressViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('', include(router.urls)),
]
