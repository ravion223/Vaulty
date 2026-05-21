from rest_framework import permissions

class HasPermission(permissions.BasePermission):
    def __init__(self, required_permission):
        self.required_permission = required_permission

    def has_permission(self, request, view):
        if not request.user.is_authenticated or not request.user.role:
            return False
        
        if request.user.is_superuser or (request.user.role and request.user.role.name == "Super Admin"):
            return True
        
        return request.user.role.permissions.filter(name=self.required_permission).exists()