from django.db import models
from apps.core.models import User, TimeStampedModel

class LoginActivity(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_activities')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    device_info = models.CharField(max_length=255, blank=True, null=True)
    successful = models.BooleanField(default=True)
    def __str__(self):
        status = "Success" if self.successful else "Failed"
        return f"{self.user.email} - {status} at {self.created_at}"

class PasswordResetRequest(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_requests')
    token = models.CharField(max_length=36, unique=True)
    used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    def __str__(self):
        return f"Password Reset for {self.user.email} - {'Used' if self.used else 'Pending'}"
