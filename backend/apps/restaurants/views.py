from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Restaurant, MenuCategory, MenuItem, RestaurantHours
from .serializers import RestaurantSerializer, MenuCategorySerializer, MenuItemSerializer, RestaurantHoursSerializer

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Read for all, Write for authenticated

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
    permission_classes = [IsAuthenticated]  # Only authenticated users can modify hours
