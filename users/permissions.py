from rest_framework import permissions

class HasPermission(permissions.BasePermission):
    def __init__(self, required_permission):
        self.required_permission = required_permission

    def has_permission(self, request, view):
        if not request.user.is_authenticated or not request.user.role:
            return False
        
        return request.user.role.permissions.filter(name=self.required_permission)