from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory, Review
from .models import Review

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    
    class Meta:
        model = CartItem
        fields = '__all__'
        read_only_fields = ['cart', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_details = serializers.SerializerMethodField()
    final_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['customer', 'restaurant', 'order_number']
    
    def get_restaurant_details(self, obj):
        return {
            'id': obj.restaurant.id,
            'name': obj.restaurant.name,
            'phone': getattr(obj.restaurant, 'phone', ''),
            'cuisine_type': getattr(obj.restaurant, 'cuisine_type', '')
        }

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=8, decimal_places=2, read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'customer', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['customer']
    
    def get_customer(self, obj):
        return {
            'first_name': obj.customer.first_name,
            'last_name': obj.customer.last_name,
            'email': obj.customer.email[:3] + '***@' + obj.customer.email.split('@')[1]  # Mask email
        }
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)