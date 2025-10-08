from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('RESTAURANT_OWNER', 'Restaurant Owner'),
        ('ADMIN', 'Admin'),
    ]
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='CUSTOMER')
    is_verified = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    class Meta:
        db_table = 'users'
    def __str__(self):
        return f"{self.email} ({self.user_type})"

class Address(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)  # Home, Office, etc.
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    class Meta:
        db_table = 'addresses'
    def __str__(self):
        return f"{self.label} - {self.user.email}"
    
class Address(TimeStampedModel):
    ADDRESS_TYPE_CHOICES = [
        ('HOME', 'Home'),
        ('WORK', 'Work'), 
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    landmark = models.CharField(max_length=255, blank=True)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES, default='HOME')
    is_default = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'addresses'
        ordering = ['-is_default', '-created_at']
    
    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other addresses for this user to non-default
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.address_type} - {self.city}, {self.state}"

