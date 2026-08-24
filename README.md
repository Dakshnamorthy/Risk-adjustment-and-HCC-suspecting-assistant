🧠 Member Risk Stratification & HCC Suspecting Assistant
🚀 Overview

This project is a cloud-based healthcare risk adjustment system that automates patient risk scoring and HCC (Hierarchical Condition Categories) mapping using an Agentic AI pipeline + Machine Learning.

The system is fully deployed on AWS Cloud, integrating storage, processing, database, and application layers to ensure scalability, security, and efficiency.

☁️ Cloud Architecture
🏗️ Infrastructure Design
Designed a complete AWS cloud architecture for a healthcare insurance risk-adjustment system.
Connected data storage, processing, database, and application layers seamlessly.
📂 Amazon S3 – Data Storage Layer
Configured Amazon S3 as the raw data storage layer.
Stored unprocessed patient records before applying HCC mapping.
Supported formats:
CSV / JSON / Excel
Patient demographics
Medical history
Lab results
Insurance details

👉 Acts as the initial data ingestion layer for secure and scalable storage.

🔐 AWS IAM – Role-Based Access Control
Implemented IAM roles to secure system access.
Backend is granted:
Read access to S3 (raw data)
Controlled access to required AWS services

👉 Ensures secure, role-based communication between services without exposing credentials.

🗄️ Amazon RDS – Structured Database
Deployed Amazon RDS (PostgreSQL) for structured data storage.
Designed database schema including:
Patient details
Year-wise patient records
Decision table (Accepted / Rejected / Review cases)

👉 Enables:

Fast querying
Organized storage
Reliable data management
🖥️ Amazon EC2 – Application Deployment
Deployed system using 3 separate EC2 instances:
🌐 Frontend Instance
Web UI
Patient search
Risk visualization
Dashboard
⚙️ Backend Instance
FastAPI APIs
Data processing
S3 integration
RDS read/write operations
🤖 Agent Instance
AI Agent workflow
HCC mapping
Risk prediction
Decision recommendation

👉 Separation ensures:

Independent execution
Better scalability
Easier maintenance
🔄 System Workflow
📥 Insurance agent uploads raw patient data → S3
⚙️ Backend fetches data from S3
🤖 Agent processes and validates data
🧮 ML model predicts risk score
🗄️ Processed data stored in RDS
📊 Results displayed via frontend
🧠 Agent Capabilities
✅ Detects
Missing documentation
Weak clinical justification
🔍 Validates
ICD-10 codes
HCC mappings
⚠️ Flags
High-risk patients
Unsupported claims
🤖 Machine Learning
Model: Random Forest Regressor
Purpose: Risk score prediction
Inputs:
Patient demographics
Diagnosis codes
Clinical features
🛠️ Tech Stack
💻 Backend
FastAPI
Python
🤖 ML
Scikit-learn
Pandas
🌐 Frontend
React
☁️ Cloud
AWS EC2
AWS S3
AWS RDS
AWS IAM
