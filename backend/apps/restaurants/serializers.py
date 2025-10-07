from rest_framework import serializers
from .models import Restaurant, MenuCategory, MenuItem, RestaurantHours

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class RestaurantHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantHours
        fields = '__all__'
