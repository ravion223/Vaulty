from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, Permission

# Register your models here.

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', )

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name',)
    filter_horizontal = ('permissions',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom fields', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_staff')