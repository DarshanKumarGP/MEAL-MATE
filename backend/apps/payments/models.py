from django.db import models
from apps.core.models import User, TimeStampedModel
from apps.orders.models import Order
from decimal import Decimal
import uuid

class Payment(TimeStampedModel):
    PAYMENT_STATUS_CHOICES = [
        ('INITIATED', 'Initiated'), ('PENDING', 'Pending'), ('AUTHORIZED', 'Authorized'),
        ('CAPTURED', 'Captured'), ('REFUNDED', 'Refunded'), ('FAILED', 'Failed'), ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('CARD', 'Credit/Debit Card'), ('UPI', 'UPI'), ('NETBANKING', 'Net Banking'),
        ('WALLET', 'Wallet'), ('EMI', 'EMI'), ('COD', 'Cash on Delivery'),
    ]
    payment_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=200, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='INITIATED')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    gateway_response = models.JSONField(blank=True, null=True)
    failure_reason = models.TextField(blank=True, null=True)
    authorized_at = models.DateTimeField(blank=True, null=True)
    captured_at = models.DateTimeField(blank=True, null=True)
    failed_at = models.DateTimeField(blank=True, null=True)
    class Meta:
        db_table = 'payments'
    def __str__(self):
        return f"Payment {self.payment_id} - {self.order.order_number}"

class PaymentWebhook(TimeStampedModel):
    EVENT_TYPES = [
        ('payment.authorized', 'Payment Authorized'),
        ('payment.captured', 'Payment Captured'),
        ('payment.failed', 'Payment Failed'),
        ('order.paid', 'Order Paid'),
        ('refund.created', 'Refund Created'),
        ('refund.processed', 'Refund Processed'),
    ]
    webhook_id = models.CharField(max_length=100, unique=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    payload = models.JSONField()
    signature = models.CharField(max_length=200)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    class Meta:
        db_table = 'payment_webhooks'
    def __str__(self):
        return f"Webhook {self.webhook_id} - {self.event_type}"

class Refund(TimeStampedModel):
    REFUND_STATUS_CHOICES = [
        ('INITIATED', 'Initiated'), ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'), ('FAILED', 'Failed'),
    ]
    REFUND_TYPE_CHOICES = [
        ('FULL', 'Full Refund'), ('PARTIAL', 'Partial Refund'),
    ]
    refund_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds')
    razorpay_refund_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    refund_type = models.CharField(max_length=10, choices=REFUND_TYPE_CHOICES, default='FULL')
    status = models.CharField(max_length=20, choices=REFUND_STATUS_CHOICES, default='INITIATED')
    reason = models.TextField()
    initiated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_refunds')
    gateway_response = models.JSONField(blank=True, null=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    class Meta:
        db_table = 'refunds'
    def __str__(self):
        return f"Refund {self.refund_id} - ₹{self.amount}"

class PaymentMethod(TimeStampedModel):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_payment_methods')
    card_token = models.CharField(max_length=200, blank=True, null=True)
    card_last_four = models.CharField(max_length=4, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)
    card_network = models.CharField(max_length=20, blank=True, null=True)
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    wallet_provider = models.CharField(max_length=50, blank=True, null=True)
    method_type = models.CharField(max_length=20, choices=Payment.PAYMENT_METHOD_CHOICES)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'payment_methods'
    def __str__(self):
        if self.method_type == 'CARD' and self.card_last_four:
            return f"{self.card_brand} ****{self.card_last_four}"
        elif self.method_type == 'UPI' and self.upi_id:
            return f"UPI: {self.upi_id}"
        return f"{self.method_type} Payment Method"

class Transaction(TimeStampedModel):
    TRANSACTION_TYPE_CHOICES = [
        ('PAYMENT', 'Payment'), ('REFUND', 'Refund'), ('PAYOUT', 'Payout'),
        ('COMMISSION', 'Commission'), ('ADJUSTMENT', 'Adjustment'),
    ]
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, null=True, blank=True)
    refund = models.ForeignKey(Refund, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    metadata = models.JSONField(blank=True, null=True)
    class Meta:
        db_table = 'transactions'
    def __str__(self):
        return f"{self.transaction_type} - ₹{self.amount} - {self.user.email}"
