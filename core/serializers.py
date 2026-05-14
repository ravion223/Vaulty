from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import Client, Account, Transaction

class AccountSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ['account_number', 'balance', 'created_at']

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
        read_only_fields = ['id', 'status', 'is_flagged', 'timestamp']
    
    def get_sender_name(self, obj):
        return f"{obj.sender.client.first_name} {obj.sender.client.last_name}" 
       
    def get_receiver_name(self, obj):
        return f"{obj.receiver.client.first_name} {obj.receiver.client.last_name}"
    
    def validate(self, data):
        # if request is patch
        
        if self.instance:
            return data

        sender = data['sender']
        receiver = data['receiver']
        amount = data['amount']

        if amount <= 0:
            raise ValidationError({"amount": "Transaction amount must be strictly greater than zero."})

        if sender == receiver:
            raise ValidationError({"receiver": "You cannot transfer money to the same account."})

        if sender.status == 'FROZEN':
            raise ValidationError({"sender": "Sender account is frozen and cannot initiate transfers."})

        if receiver.status == 'FROZEN':
            raise ValidationError({"receiver": "Receiver account is frozen and cannot accept transfers."})

        if sender.currency != receiver.currency:
            raise ValidationError({"amount": "Cross-currency transfers are not supported yet."})

        if sender.balance < amount:
            raise ValidationError({"amount": "Insufficient funds on the sender's account."})

        return data
    
    def create(self, validated_data):
        sender = validated_data['sender']
        receiver = validated_data['receiver']
        amount = validated_data['amount']

        with transaction.atomic():
            sender.balance -= amount
            sender.save()

            receiver.balance += amount
            receiver.save()

            validated_data['status'] = Transaction.Status.COMPLETED

            return super().create(validated_data)