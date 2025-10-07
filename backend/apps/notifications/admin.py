from django.contrib import admin
from .models import Notification, OrderStatusUpdate

admin.site.register(Notification)
admin.site.register(OrderStatusUpdate)
