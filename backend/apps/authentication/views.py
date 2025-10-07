from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from apps.core.models import User
from apps.core.serializers import UserSerializer
from .models import LoginActivity, PasswordResetRequest
from .serializers import LoginActivitySerializer, PasswordResetRequestSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """User registration endpoint"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        # Create user with hashed password
        user_data = serializer.validated_data
        password = user_data.pop('password')
        user = User.objects.create_user(password=password, **user_data)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """User login endpoint"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if email and password:
        user = authenticate(username=email, password=password)
        if user:
            # Log login activity
            LoginActivity.objects.create(
                user=user,
                ip_address=request.META.get('REMOTE_ADDR'),
                device_info=request.META.get('HTTP_USER_AGENT', '')[:255],
                successful=True
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            # Log failed login
            try:
                failed_user = User.objects.get(email=email)
                LoginActivity.objects.create(
                    user=failed_user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    device_info=request.META.get('HTTP_USER_AGENT', '')[:255],
                    successful=False
                )
            except User.DoesNotExist:
                pass
                
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_user(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

# ViewSets for admin management
class LoginActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoginActivity.objects.all()
    serializer_class = LoginActivitySerializer

class PasswordResetRequestViewSet(viewsets.ModelViewSet):
    queryset = PasswordResetRequest.objects.all()
    serializer_class = PasswordResetRequestSerializer
