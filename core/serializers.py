from rest_framework import serializers
from .models import Client, Account, Transaction

class AccountSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = '__all__'

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"


class ClientSerializer(serializers.ModelSerializer):
    accounts = AccountSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'
    
    def get_sender_name(self, obj):
        return f"{obj.sender.client.first_name} {obj.sender.client.last_name}"    
    def get_receiver_name(self, obj):
        return f"{obj.receiver.client.first_name} {obj.receiver.client.last_name}"