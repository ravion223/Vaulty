from django.contrib import admin
from .models import Client, Transaction, Account

# Register your models here.

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'kyc_status', 'risk_level', 'phone_number')
    list_filter = ('kyc_status', 'risk_level', 'created_at')
    search_fields = ('first_name', 'last_name', 'tax_number', 'phone_number')

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'client', 'currency', 'balance', 'status')
    list_filter = ('currency', 'status')
    search_fields = ('account_number', 'client__first_name', 'client__last_name')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'amount', 'status', 'is_flagged', 'timestamp')
    list_filter = ('status', 'is_flagged', 'timestamp')
    search_fields = ('id', 'sender__account_number', 'receiver__account_number')