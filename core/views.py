from django.shortcuts import render
from rest_framework import viewsets
from .models import Client, Account, Transaction
from .serializers import ClientSerializer, AccountSerializer, TransactionSerializer

# Create your views here.

class ClientViewSet(viewsets.ModelViewSet):
    # avoiding n+1 query problem
    queryset = Client.objects.prefetch_related('accounts').all()
    serializer_class = ClientSerializer
    

class AccountViewSet(viewsets.ModelViewSet):
    # avoiding n+1 query problem
    queryset = Account.objects.select_related('client').all()
    serializer_class = AccountSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer