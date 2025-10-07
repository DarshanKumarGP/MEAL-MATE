import razorpay
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
import json
import hmac
import hashlib
import logging

from .models import Payment, PaymentWebhook, Refund, PaymentMethod, Transaction
from .serializers import PaymentSerializer, PaymentWebhookSerializer, RefundSerializer, PaymentMethodSerializer, TransactionSerializer
from apps.orders.models import Order

logger = logging.getLogger(__name__)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_razorpay_order(self, request):
        """Create Razorpay order for payment"""
        try:
            order_id = request.data.get('order_id')
            amount = request.data.get('amount')  # Amount in rupees
            
            if not order_id or not amount:
                return Response(
                    {'error': 'Order ID and amount are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the order
            try:
                order = Order.objects.get(id=order_id, customer=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Initialize Razorpay client
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            
            # Create Razorpay order
            razorpay_order = client.order.create({
                'amount': int(float(amount) * 100),  # Amount in paise
                'currency': 'INR',
                'receipt': f'order_{order.order_number}',
                'notes': {
                    'order_id': str(order.id),
                    'customer_email': request.user.email
                }
            })
            
            # Create or update payment record
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'customer': request.user,
                    'razorpay_order_id': razorpay_order['id'],
                    'amount': amount,
                    'currency': 'INR',
                    'status': 'INITIATED'
                }
            )
            
            if not created:
                payment.razorpay_order_id = razorpay_order['id']
                payment.amount = amount
                payment.status = 'INITIATED'
                payment.save()
            
            return Response({
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
                'payment_id': payment.payment_id
            })
            
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """Verify Razorpay payment"""
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return Response(
                    {'error': 'Missing payment verification data'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify signature
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            
            try:
                client.utility.verify_payment_signature({
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                })
                
                # Update payment record
                payment = Payment.objects.get(
                    razorpay_order_id=razorpay_order_id,
                    customer=request.user
                )
                payment.razorpay_payment_id = razorpay_payment_id
                payment.razorpay_signature = razorpay_signature
                payment.status = 'CAPTURED'
                payment.captured_at = timezone.now()
                payment.save()
                
                # Update order payment status
                order = payment.order
                order.payment_status = 'PAID'
                order.status = 'CONFIRMED'
                order.save()
                
                # Create transaction record
                Transaction.objects.create(
                    user=request.user,
                    transaction_type='PAYMENT',
                    amount=payment.amount,
                    description=f'Payment for order #{order.order_number}',
                    payment=payment,
                    order=order
                )
                
                return Response({
                    'status': 'success', 
                    'message': 'Payment verified successfully',
                    'order_id': order.id,
                    'order_number': order.order_number
                })
                
            except razorpay.errors.SignatureVerificationError:
                # Update payment as failed
                try:
                    payment = Payment.objects.get(
                        razorpay_order_id=razorpay_order_id,
                        customer=request.user
                    )
                    payment.status = 'FAILED'
                    payment.failure_reason = 'Signature verification failed'
                    payment.failed_at = timezone.now()
                    payment.save()
                except Payment.DoesNotExist:
                    pass
                
                return Response(
                    {'error': 'Payment verification failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentWebhookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentWebhook.objects.all()
    serializer_class = PaymentWebhookSerializer
    permission_classes = [IsAuthenticated]

class RefundViewSet(viewsets.ModelViewSet):
    serializer_class = RefundSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_payments = Payment.objects.filter(customer=self.request.user)
        return Refund.objects.filter(payment__in=user_payments)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')
