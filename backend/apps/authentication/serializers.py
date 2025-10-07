from rest_framework import serializers
from .models import LoginActivity, PasswordResetRequest

class LoginActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginActivity
        fields = '__all__'

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetRequest
        fields = '__all__'
