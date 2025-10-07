from django.contrib import admin
from .models import Restaurant, MenuCategory, MenuItem, RestaurantHours

admin.site.register(Restaurant)
admin.site.register(MenuCategory)
admin.site.register(MenuItem)
admin.site.register(RestaurantHours)
