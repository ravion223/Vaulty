from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
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


class DashboardStatsView(APIView):
    def get(self, request):
        total_balance = Account.objects.aggregate(total=Sum('balance'))['total'] or 0

        active_clients = Client.objects.count()

        yesterday = timezone.now() - timedelta(days=1)
        tx_24h = Transaction.objects.filter(timestamp__gte=yesterday).count()

        flagged_tx = Transaction.objects.filter(is_flagged=True).count()

        # Static for now
        chart_data = [
            { 'name': 'Mon', 'balance': 4000 },
            { 'name': 'Tue', 'balance': 3000 },
            { 'name': 'Wed', 'balance': 5000 },
            { 'name': 'Thu', 'balance': 2780 },
            { 'name': 'Fri', 'balance': 8890 },
            { 'name': 'Sat', 'balance': 2390 },
            { 'name': 'Sun', 'balance': float(total_balance % 10000) },
        ]

        return Response({
            "total_balance": total_balance,
            "active_clients": active_clients,
            "transactions_24h": tx_24h,
            "flagged_transactions": flagged_tx,
            "chart_data": chart_data,
        })