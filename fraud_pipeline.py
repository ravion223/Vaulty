from pyspark.sql import SparkSession
import pyspark.sql.functions as F
import time
import os
import logging
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def run_pipeline():
    logger.info("Fraud detection pipeline initialization")

    spark = SparkSession.builder \
        .appName("Vaulty Fraud Pipeline") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.postgresql:postgresql:42.5.4") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    input_path = "work/data/incoming/*.csv"
    output_path = "work/data/flagged/suspicious_transactions.parquet"

    start_time = time.time()

    logger.info("Reading new transactions from /incoming...")
    df = spark.read.csv(input_path, header=True, inferSchema=True)

    logger.info("Analysis started")
    suspicious_df = df.filter((F.col("amount") > 50000) | (F.col("is_flagged") == True))
    suspicious_df = suspicious_df.withColumn("processed_at", F.current_timestamp())

    logger.info("Saving")

    jdbc_url = f"jdbc:postgresql://ep-red-star-a26i4qv9-pooler.eu-central-1.aws.neon.tech:5432/neondb?sslmode=require&channel_binding=require"

    connection_properties = {
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "driver": "org.postgresql.Driver"
    }

    print(f"Anomalies found: {suspicious_df.count()}")
    suspicious_df.write.jdbc(
        url=jdbc_url,
        table="core_transaction_flagged",
        mode="append",
        properties=connection_properties
    )

    spark.stop()

    logger.info(f"Pipeline finished successfully in {round(time.time() - start_time, 2)}")


if __name__ == "__main__":
    run_pipeline()