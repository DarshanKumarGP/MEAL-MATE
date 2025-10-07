from django.contrib import admin
from .models import LoginActivity, PasswordResetRequest

admin.site.register(LoginActivity)
admin.site.register(PasswordResetRequest)
