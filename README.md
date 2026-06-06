
# Vaulty

[![Live Demo](https://img.shields.io/badge/demo-online-emerald.svg)](https://vaulty-kappa.vercel.app)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#) [![Django](https://img.shields.io/badge/Django-%23092E20.svg?logo=django&logoColor=white)](#) [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#) [![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#) [![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](#) [![Apache Spark](https://img.shields.io/badge/Apache%20Spark-E25A1C?logo=apachespark&logoColor=fff)](#) [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#) [![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?logo=vercel&logoColor=white)](#) [![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=000)](#)

Vaulty is an advanced fullstack fintech platform designed to manage bank clients, handle multi-currency accounts, and monitor financial transactions through interactive analytics dashboards. Powered by a high-volume data generation and analytics pipeline via PySpark, the application is secured using stateful JWT authentication and strict Role-Based Access Control (RBAC). Built with a responsive, desktop-first layout comprehensively optimized for seamless mobile viewports, it features anti-fraud transaction flagging and rigorous compliance monitoring (AML/KYC).

## Description

The project serves as a comprehensive financial analytics platform and enterprise-grade API, designed to handle high-volume transaction datasets generated via PySpark pipelines. It bridges the gap between heavy data processing and interactive user interfaces, focusing on secure financial operations, complex data filtering, and ironclad permission management.
 
> ⚠️ **Disclaimer:** This is a personal fullstack portfolio project developed for educational purposes[cite: 1]. All financial records, client profiles, tax identification numbers (TIN), and transaction logs displayed within the platform are entirely fictional and generated programmatically for demonstration purposes.

### Key Features
* **Financial Management Dashboards:** Data-dense management views for reviewing bank client profiles, transaction histories, and currency balances (`USD`, `EUR`, `UAH`) formatted via `Intl.NumberFormat`. 
* **PySpark Mock Data Generation:** Scalable big data processing scripts used to programmatically generate, clean, and structure millions of mock transaction records to populate the PostgreSQL database. 
* **Secure JWT Authentication:** Session protection utilizing access and refresh token flows to secure platform navigation and backend API endpoints.
* **Granular Security (RBAC):** Interface controls and management buttons dynamically adapt using a custom `<AccessGuard permission="..." />` React wrapper based on assigned user roles. 
* **Compliance Workflows:** Active interface tools to moderate customer KYC verification states (`APPROVED`, `PENDING`, `REJECTED`), assign AML risk tiers (`LOW`, `MEDIUM`, `HIGH`), and flag suspicious transactions (`FLAGGED / CLEAR`). 
* **UX Optimizations:** Custom *Card-Stack Conversion* to neatly transform desktop data rows into mobile layouts, targeted WebKit overrides for iOS Safari, and cumulative layout shift (CLS) mitigation using geometry-mirroring Skeleton Loaders.

## Installation

Vaulty is organized as a monorepository. Follow these steps to get your local environment running.

### Prerequisites
* Python 3.10+
* Node.js 18+
* WSL Ubuntu environment with Apache Spark & Java installed (for the data pipeline)


### Environment Variables
Create a `.env` file in the root directory (you can copy structure from `.env.example`). Populate it with your cloud Neon.tech credentials:

```env
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
SECRET_KEY=your_django_secret_key
```

### Backend Setup
Before running the big data ingestion, you must initialize the cloud database schema. Django ORM will programmatically build the necessary tables (including `core_transaction_flagged`) inside Neon.tech:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```
### Big Data Infrastructure (Docker Desktop)

Spin up the isolated big data environment (Jupyter Notebook pre-configured with Apache Spark binaries) used to execute the heavy data jobs:

Bash

```
# Ensure Docker Desktop is active, then run:
docker-compose up -d
```

### Frontend Setup
Navigate to the frontend directory and install the required npm packages:

```bash
cd frontend
npm install
```

### Data Pipeline Setup (WSL Ubuntu)
Once the Django migrations have successfully structured your Neon.tech database and the Docker environment is online, execute the ETL workload.

Before starting the web applications, you need to generate the mock transaction dataset and execute the PySpark ingestion pipeline:

```bash
# 1. Generate the initial heavy dataset (Creates a 20-million-row transaction CSV)
python generate_transactions.py

# 2. Run the PySpark ETL pipeline inside WSL Ubuntu
# This job filters records where is_flagged == True and ingests them directly into the PostgreSQL 'core_transaction_flagged' table
spark-submit --packages org.postgresql:postgresql:42.5.4 work/fraud_pipeline.py

```

### Usage
**Running the Backend Server**
From the backend directory with your virtual environment active:

```bash
python manage.py runserver
```

The API server will start at `http://localhost:8000`.

**Running the Frontend Client**

From the `frontend` directory:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`
    

## Contributing

This is a personal fullstack portfolio project. While external pull requests are not actively sought at this stage, feel free to fork the repository, experiment with the codebase, or use the layout patterns for your own applications.

## License

This project is open-source and available under the [MIT License](LICENSE).
