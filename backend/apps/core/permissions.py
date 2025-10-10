from rest_framework import permissions

class IsRestaurantOwner(permissions.BasePermission):
    """
    Custom permission to only allow restaurant owners to access restaurant management.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_restaurant_owner

class IsCustomer(permissions.BasePermission):
    """
    Custom permission to only allow customers to place orders.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_customer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
