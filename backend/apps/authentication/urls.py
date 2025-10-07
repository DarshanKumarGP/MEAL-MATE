from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from .views import (
    LoginActivityViewSet, 
    PasswordResetRequestViewSet,
    register_user,
    login_user,
    logout_user
)

router = routers.DefaultRouter()
router.register(r'login-activity', LoginActivityViewSet)
router.register(r'password-reset', PasswordResetRequestViewSet)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
