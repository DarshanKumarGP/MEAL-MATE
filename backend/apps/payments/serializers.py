from rest_framework import serializers
from .models import Payment, PaymentWebhook, Refund, PaymentMethod, Transaction

class PaymentSerializer(serializers.ModelSerializer):
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['customer', 'payment_id', 'created_at', 'updated_at']

class PaymentWebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentWebhook
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    payment_order_number = serializers.CharField(source='payment.order.order_number', read_only=True)
    
    class Meta:
        model = Refund
        fields = '__all__'
        read_only_fields = ['refund_id', 'created_at', 'updated_at']

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'
        read_only_fields = ['customer', 'created_at', 'updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['transaction_id', 'user', 'created_at', 'updated_at']
