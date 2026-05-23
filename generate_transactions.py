import os
import csv
import random
from datetime import datetime, timedelta
import time

TOTAL_ROWS = 20_000_000
BATCH_SIZE = 100_000
FILENAME = "transactions_20M.csv"

START_DATE = datetime(2019, 1, 1)
END_DATE = datetime.now()
TIME_BETWEEN = int((END_DATE - START_DATE).total_seconds())

real_accounts = []

if os.path.exists('accounts.txt'):
    with open('accounts.txt', 'r') as f:
        real_accounts = [line.strip().replace('"', '') for line in f.readlines()[1:]]
        real_accounts = [acc for acc in real_accounts if acc]

synthetic_accounts = [f"SYNTH{str(i).zfill(7)}" for i in range(50000)]

ACCOUNT_POOL = real_accounts + synthetic_accounts

STATUSES = ['COMPLETED', 'PENDING', 'FAILED']

def generate_data():
    print(f"Starting generation of {TOTAL_ROWS:,} rows...")
    print(f"Accounts amount in pool: {len(ACCOUNT_POOL):,}")
    start_time = time.time()

    with open(FILENAME, mode="w", newline='') as file:
        writer = csv.writer(file)

        writer.writerow(['transaction_id', 'account_from', 'account_to', 'amount', 'timestamp', 'status', 'is_flagged'])

        for batch_num in range(TOTAL_ROWS // BATCH_SIZE):
            batch = []
            for i in range(BATCH_SIZE):
                trx_id = f"TRX-{batch_num * BATCH_SIZE + i}"
                acc_from = random.choice(ACCOUNT_POOL)
                acc_to = random.choice(ACCOUNT_POOL)

                if random.random() < 0.01:
                    amount = round(random.uniform(50000, 150000), 2)
                else:
                    amount = round(random.uniform(5, 5000), 2)

                random_second = random.randint(0, TIME_BETWEEN)
                trx_date = START_DATE + timedelta(seconds=random_second)

                status = random.choices(STATUSES, weights=[0.8, 0.15, 0.05], k=1)[0]
                is_flagged = random.random() < 0.05

                batch.append([
                    trx_id,
                    acc_from,
                    acc_to,
                    amount,
                    trx_date.strftime("%Y-%m-%d %H:%M:%S"),
                    status,
                    is_flagged
                ])

            writer.writerows(batch)

            if (batch_num + 1) % 20 == 0:
                print(f"Generated {(batch_num + 1) * BATCH_SIZE:,} rows...")

    end_time = time.time()
    print(f"Completed! File {FILENAME} successfully created.")
    print(f"Completion time: {round(end_time - start_time, 2)} seconds")

if __name__ == "__main__":
    generate_data()