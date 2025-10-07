from django.db import models
from apps.core.models import User, TimeStampedModel

class Notification(TimeStampedModel):
    NOTIFICATION_TYPE = [
        ("ORDER", "Order Update"),
        ("PROMO", "Promotion"),
        ("SYSTEM", "System Message"),
        ("GENERAL", "General"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=120)
    message = models.TextField()
    type = models.CharField(max_length=15, choices=NOTIFICATION_TYPE, default="GENERAL")
    is_read = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.title} ({self.type}) for {self.user.email}"

class OrderStatusUpdate(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_updates')
    order_id = models.CharField(max_length=20)  # If not foreign key, use char
    status = models.CharField(max_length=32)
    message = models.TextField(blank=True)
    def __str__(self):
        return f"Order {self.order_id}: {self.status}"
