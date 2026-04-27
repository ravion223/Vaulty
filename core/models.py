import uuid
from django.db import models

# Create your models here.

class Client(models.Model):
    class KYCStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    class RiskLevel(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    first_name = models.CharField(
        max_length=32
    )
    last_name = models.CharField(
        max_length=32
    )
    tax_number = models.CharField(
        max_length=20,
        unique=True
    )
    email = models.EmailField(
        unique=True
    )
    phone_number = models.CharField(
        unique=True,
        max_length=15
    )
    kyc_status = models.CharField(
        max_length=10,
        choices=KYCStatus.choices,
        default=KYCStatus.PENDING
    )
    risk_level = models.CharField(
        max_length=10,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} - ({self.get_kyc_status_display()})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'


class Account(models.Model):
    class Currency(models.TextChoices):
        UAH = 'UAH', 'uah'
        EUR = 'EUR', 'eur'
        USD = 'USD', 'usd'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        FROZEN = 'FROZEN', 'Frozen'

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='accounts')
    
    account_number = models.CharField(
        max_length=35
    )
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.USD
    )
    balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00
    )
    status = models.CharField(
        max_length=6,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.account_number} - {self.currency} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'


class Transaction(models.Model):
    class Status(models.TextChoices):
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    sender = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='outgoing_transactions')
    receiver = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='incoming_transactions')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PROCESSING
    )
    is_flagged = models.BooleanField(
        default=False
    )
    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Tx: {self.amount} | flagged: {self.is_flagged}"
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'