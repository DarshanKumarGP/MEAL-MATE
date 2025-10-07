from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField
from apps.core.models import User, TimeStampedModel
from decimal import Decimal

class Restaurant(TimeStampedModel):
    CUISINE_CHOICES = [
        ('INDIAN', 'Indian'),
        ('CHINESE', 'Chinese'),
        ('ITALIAN', 'Italian'),
        ('MEXICAN', 'Mexican'),
        ('THAI', 'Thai'),
        ('AMERICAN', 'American'),
        ('CONTINENTAL', 'Continental'),
        ('FAST_FOOD', 'Fast Food'),
        ('DESSERTS', 'Desserts'),
        ('BEVERAGES', 'Beverages'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField()
    cuisine_type = models.CharField(max_length=20, choices=CUISINE_CHOICES)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='restaurants')
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    minimum_order = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    delivery_radius = models.PositiveIntegerField(default=5)
    logo = models.ImageField(upload_to='restaurants/logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='restaurants/covers/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    is_featured = models.BooleanField(default=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    total_reviews = models.PositiveIntegerField(default=0)
    total_orders = models.PositiveIntegerField(default=0)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15.00'))
    class Meta:
        db_table = 'restaurants'
    def __str__(self):
        return self.name

class MenuCategory(TimeStampedModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'menu_categories'
        ordering = ['display_order', 'name']
        unique_together = ['restaurant', 'name']
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

class MenuItem(TimeStampedModel):
    DIETARY_CHOICES = [
        ('VEG', 'Vegetarian'),
        ('NON_VEG', 'Non-Vegetarian'),
        ('VEGAN', 'Vegan'),
        ('EGG', 'Egg'),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    dietary_type = models.CharField(max_length=10, choices=DIETARY_CHOICES, default='VEG')
    allergens = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    ingredients = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    preparation_time = models.PositiveIntegerField(default=15)  # minutes
    popularity_score = models.PositiveIntegerField(default=0)
    total_orders = models.PositiveIntegerField(default=0)
    class Meta:
        db_table = 'menu_items'
        indexes = [
            models.Index(fields=['restaurant', 'is_available']),
            models.Index(fields=['dietary_type']),
            models.Index(fields=['-popularity_score']),
        ]
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"
    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price
    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price

class RestaurantHours(TimeStampedModel):
    DAYS_OF_WEEK = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='operating_hours')
    day_of_week = models.PositiveSmallIntegerField(choices=DAYS_OF_WEEK)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    class Meta:
        db_table = 'restaurant_hours'
        unique_together = ['restaurant', 'day_of_week']
    def __str__(self):
        return f"{self.restaurant.name} - {self.get_day_of_week_display()}"
