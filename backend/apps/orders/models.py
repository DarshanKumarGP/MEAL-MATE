from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import User, TimeStampedModel
from apps.restaurants.models import Restaurant, MenuItem
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.restaurants.models import Restaurant

class Cart(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    class Meta:
        db_table = 'carts'
    def __str__(self):
        return f"Cart - {self.user.email if self.user else self.session_id}"
    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())
    def clear(self):
        self.items.all().delete()

class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    special_instructions = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'menu_item']
    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"
    @property
    def subtotal(self):
        return self.unit_price * self.quantity
    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.menu_item.effective_price
        super().save(*args, **kwargs)

class Order(TimeStampedModel):
    ORDER_STATUS_CHOICES = [
        ('PENDING', 'Pending'), ('CONFIRMED', 'Confirmed'), ('PREPARING', 'Preparing'),
        ('READY', 'Ready for Pickup'), ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'), ('CANCELLED', 'Cancelled'), ('REFUNDED', 'Refunded'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'), ('PAID', 'Paid'), ('FAILED', 'Failed'), ('REFUNDED', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('RAZORPAY', 'Razorpay'), ('COD', 'Cash on Delivery'), ('WALLET', 'Wallet'),
    ]
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    delivery_address = models.JSONField()
    delivery_phone = models.CharField(max_length=15)
    delivery_instructions = models.TextField(blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='RAZORPAY')
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    def __str__(self):
        return f"Order {self.order_number} - {self.customer.email}"
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    def generate_order_number(self):
        import random, string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    @property
    def final_amount(self):
        return self.total_amount + self.delivery_fee + self.tax_amount - self.discount_amount

class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    special_instructions = models.TextField(blank=True)
    class Meta:
        db_table = 'order_items'
    def __str__(self):
        return f"{self.order.order_number} - {self.menu_item.name} x {self.quantity}"
    @property
    def subtotal(self):
        return self.unit_price * self.quantity

class OrderStatusHistory(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.ORDER_STATUS_CHOICES)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    notes = models.TextField(blank=True)
    class Meta:
        db_table = 'order_status_history'
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"

class Review(TimeStampedModel):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    food_rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    delivery_rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    is_approved = models.BooleanField(default=True)
    class Meta:
        db_table = 'reviews'
        unique_together = ['customer', 'order']
    def __str__(self):
        return f"{self.restaurant.name} - {self.rating}/5 by {self.customer.email}"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.restaurant.update_rating()


User = get_user_model()

class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['customer', 'restaurant', 'order']  # One review per customer per order
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.email} - {self.restaurant.name} - {self.rating} stars"