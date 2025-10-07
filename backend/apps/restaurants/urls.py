from rest_framework import routers
from django.urls import path, include
from .views import RestaurantViewSet, MenuCategoryViewSet, MenuItemViewSet, RestaurantHoursViewSet

router = routers.DefaultRouter()
router.register(r'restaurants', RestaurantViewSet)
router.register(r'categories', MenuCategoryViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'restaurant-hours', RestaurantHoursViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
