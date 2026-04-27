import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from core.models import Client, Account, Transaction
from faker import Faker

class Command(BaseCommand):
    help = 'Generating testing data for bank Vaulty (Clients, Accounts, Transactions)'

    def handle(self, *args, **kwargs):
        fake = Faker()

        self.stdout.write(self.style.WARNING('Deleting old data...'))
        Transaction.objects.all().delete()
        Account.objects.all().delete()
        Client.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Database cleared. Starting generation...'))

        clients_to_create = []
        for _ in range(100):
            clients_to_create.append(
                Client(
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    tax_number=fake.ssn(),
                    email=fake.unique.email(),
                    phone_number=fake.unique.msisdn()[:15],
                    kyc_status=random.choice(Client.KYCStatus.choices)[0],
                    risk_level=random.choice(Client.RiskLevel.choices)[0]
                )
            )
        Client.objects.bulk_create(clients_to_create)
        self.stdout.write(self.style.SUCCESS(f'Created 100 clients'))
        
        accounts_to_create = []
        all_clients = Client.objects.all()

        for client in all_clients:
            num_accounts = random.randint(1, 2)
            for _ in range(num_accounts):
                accounts_to_create.append(
                    Account(
                        client=client,
                        account_number=fake.iban(),
                        currency=random.choice(Account.Currency.choices)[0],
                        balance=Decimal(random.uniform(100.00, 10000.00)),
                        status=random.choice(Account.Status.choices)[0]
                    )
                )
        Account.objects.bulk_create(accounts_to_create)
        self.stdout.write(self.style.SUCCESS(f'Created 100 accounts'))

        transactions_to_create = []
        all_accounts = Account.objects.all()

        for _ in range(1000):
            sender = random.choice(Account.objects.all())
            receiver = random.choice(Account.objects.all())

            while sender == receiver:
                receiver = random.choice(all_accounts)

            transactions_to_create.append(
                Transaction(
                    sender=sender,
                    receiver=receiver,
                    amount=Decimal(random.uniform(100.00, 10000.00)),
                    status=random.choice(Transaction.Status.choices)[0],
                    is_flagged=random.choice([False, True]),
                )
            )
        
        Transaction.objects.bulk_create(transactions_to_create)
        self.stdout.write(self.style.SUCCESS(f'Created 1000 transactions'))

        self.stdout.write(self.style.SUCCESS('Successfully finished generating!'))