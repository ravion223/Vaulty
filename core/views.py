import csv
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets, filters, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Count, Sum, Max, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import Client, Account, Transaction, FlaggedTransaction
from .serializers import ClientSerializer, AccountSerializer, TransactionSerializer, FlaggedTransactionSerializer

# Create your views here.

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related('accounts').all()
    serializer_class = ClientSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get_queryset(self):
        queryset = super().get_queryset()

        risk = self.request.query_params.get('risk', None)
        if risk:
            queryset = queryset.filter(risk_level=risk)

        kyc_status = self.request.query_params.get('kyc_status', None)
        if kyc_status:
            queryset = queryset.filter(kyc_status=kyc_status)

        return queryset
    

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.select_related('client').all()
    serializer_class = AccountSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['client__first_name', 'client__last_name']

    def get_queryset(self):
        queryset = super().get_queryset()

        is_frozen = self.request.query_params.get('is_frozen', None)
        if is_frozen == 'true':
            queryset = queryset.filter(status='FROZEN')

        currency = self.request.query_params.get('currency', None)
        if currency:
            queryset = queryset.filter(currency=currency)

        return queryset



class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('sender', 'receiver').all()
    serializer_class = TransactionSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = [
        'id',
        'sender__client__first_name',
        'sender__client__last_name',
        'receiver__client__first_name',
        'receiver__client__last_name'
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        is_flagged = self.request.query_params.get('is_flagged', None)
        if is_flagged == 'true':
            queryset = queryset.filter(is_flagged=True)

        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Transaction ID', 'Sender Account', 'Receiver Account', 'Amount', 'Status', 'Date', 'Flagged'])

        for tx in queryset:
            writer.writerow([
                f"TRX-{str(tx.id)[:8]}",
                f"{tx.sender.client.first_name} {tx.sender.client.last_name}",
                f"{tx.receiver.client.first_name} {tx.receiver.client.last_name}",
                tx.amount,
                tx.status,
                tx.timestamp.strftime('%Y-%m-%d %H: %M: %S'),
                'Yes' if tx.is_flagged else 'No'
            ])
        
        return response

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        def refresh_demo_dates():
            latest_tx = Transaction.objects.aggregate(max_ts=Max('timestamp'))['max_ts']

            if latest_tx:
                now = timezone.now()
                
                if latest_tx < now - timedelta(days=1):
                    delta = now - latest_tx

                    Transaction.objects.update(timestamp=F('timestamp') + delta)
        
        refresh_demo_dates()

        currency = self.request.query_params.get('currency', 'USD')

        total_balance = Account.objects.filter(currency=currency).aggregate(total=Sum('balance'))['total'] or 0

        active_clients = Client.objects.filter(accounts__currency=currency).distinct().count()

        flagged_tx = Transaction.objects.filter(
            is_flagged=True,
            sender__currency=currency
        ).count()

        today = timezone.now().date()
        last_7_days = today - timedelta(days=6)

        tx_7_days = Transaction.objects.filter(
            sender__currency=currency,
            timestamp__date__gte=last_7_days
        ).count()

        daily_stats = Transaction.objects.filter(
            sender__currency = currency,
            status="COMPLETED",
            timestamp__date__gte=last_7_days
        ).annotate(
            day=TruncDate('timestamp')
        ).values('day').annotate(
            total=Sum('amount')
        ).order_by('day')
        
        stats_dict = {item['day']: item['total'] for item in daily_stats}

        chart_data = []
        for i in range(6, -1, -1):
            current_day = today - timedelta(days=i)

            day_volume = stats_dict.get(current_day, 0)

            chart_data.append({
                "name": current_day.strftime("%a"),
                "balance": float(day_volume)
            })

        return Response({
            "total_balance": total_balance,
            "active_clients": active_clients,
            "transactions_7_days": tx_7_days,
            "flagged_transactions": flagged_tx,
            "chart_data": chart_data,
        })
    

class FlaggedTransactionViewSet(mixins.ListModelMixin,          # Allows GET (list)
                                mixins.RetrieveModelMixin,      # Allows GET (single obj)
                                mixins.UpdateModelMixin,        # Allows PATCH / PUT
                                viewsets.GenericViewSet):       # Basic class for router
    queryset = FlaggedTransaction.objects.filter(is_flagged=True).order_by('-amount')
    serializer_class = FlaggedTransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        currency = self.request.query_params.get('currency')
        if currency:
            queryset = queryset.filter(currency=currency)
            
        return queryset

    # Search by custom id, not id in db
    lookup_field = 'transaction_id'