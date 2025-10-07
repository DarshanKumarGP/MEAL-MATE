from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, PaymentWebhookViewSet, RefundViewSet, PaymentMethodViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'webhooks', PaymentWebhookViewSet, basename='webhook')
router.register(r'refunds', RefundViewSet, basename='refund')
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
