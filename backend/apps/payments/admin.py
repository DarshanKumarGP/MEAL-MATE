from django.contrib import admin
from .models import Payment, PaymentWebhook, Refund, PaymentMethod, Transaction

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'order', 'customer', 'amount', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['payment_id', 'razorpay_payment_id', 'customer__email', 'order__order_number']
    readonly_fields = ['payment_id', 'created_at', 'updated_at']

@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ['webhook_id', 'event_type', 'processed', 'created_at']
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['webhook_id', 'razorpay_payment_id']

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['refund_id', 'payment', 'amount', 'status', 'refund_type', 'created_at']
    list_filter = ['status', 'refund_type', 'created_at']
    search_fields = ['refund_id', 'razorpay_refund_id']
    readonly_fields = ['refund_id', 'created_at', 'updated_at']

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['customer', 'method_type', 'is_default', 'is_active', 'created_at']
    list_filter = ['method_type', 'is_default', 'is_active', 'created_at']
    search_fields = ['customer__email', 'card_last_four', 'upi_id']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'transaction_type', 'amount', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['transaction_id', 'user__email', 'description']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at']
