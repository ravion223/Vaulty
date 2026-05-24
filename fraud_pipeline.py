from pyspark.sql import SparkSession
import pyspark.sql.functions as F
import time
import os

def run_pipeline():
    print("Fraud detection pipeline initialization")

    spark = SparkSession.builder \
        .appName("Vaulty Fraud Pipeline") \
        .master("local[*]") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    input_path = "work/data/incoming/*.csv"
    output_path = "work/data/flagged/suspicious_transactions.parquet"

    start_time = time.time()

    print("Reading new transactions from /incoming...")
    df = spark.read.csv(input_path, header=True, inferSchema=True)

    print("Analysis started")
    suspicious_df = df.filter((F.col("amount") > 50000) | (F.col("is_flagged") == True))

    suspicious_df = suspicious_df.withColumn("processed_at", F.current_timestamp())

    print("Saving")
    suspicious_df.write.mode("overwrite").parquet(output_path)

    spark.stop()

    print(f"Pipeline finished successfully in {round(time.time() - start_time, 2)}")


if __name__ == "__main__":
    run_pipeline()