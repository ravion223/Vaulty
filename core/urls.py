from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, AccountViewSet, TransactionViewSet, DashboardStatsView, FlaggedTransactionViewSet

router = DefaultRouter()

router.register(r'clients', ClientViewSet)
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'flagged-transactions', FlaggedTransactionViewSet, basename='flagged-transactions')

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name="dashboard-stats"),
    path('', include(router.urls))
]
