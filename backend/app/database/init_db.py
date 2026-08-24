from sqlalchemy import text
from app.database.connection import engine

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure members_2025 table exists
CREATE TABLE IF NOT EXISTS members_2025 (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    age INTEGER,
    sex VARCHAR(10),
    year INTEGER,
    number_of_encounters INTEGER,
    number_of_diagnoses INTEGER,
    chronic_condition_count INTEGER,
    unique_icd10_count INTEGER,
    repeated_diagnosis_count INTEGER,
    recent_encounter_count INTEGER,
    specialist_encounter_count INTEGER,
    hospitalization_history VARCHAR(50),
    encounter_type VARCHAR(50),
    claim_frequency INTEGER,
    disease_description TEXT,
    diagnosis_frequency INTEGER,
    diagnosis_recency_days INTEGER,
    provider_count INTEGER,
    claim_count INTEGER,
    icd10_code VARCHAR(50),
    diagnosis_seen_repeatedly_over_12_months VARCHAR(20),
    claim_type VARCHAR(50),
    provider_id VARCHAR(50),
    number_of_encounters_associated_with_diagnosis INTEGER,
    diagnosis_seen_once VARCHAR(20),
    diagnosis_seen_5_times VARCHAR(20),
    -- HCC mapping fields
    hcc_code VARCHAR(50),
    mapping_status VARCHAR(50) DEFAULT 'UNMAPPED',
    -- Classification fields
    classification_status VARCHAR(50),
    review_status VARCHAR(50) DEFAULT 'NOT_REVIEWED',
    is_current_upload BOOLEAN DEFAULT FALSE,
    available_for_agent BOOLEAN DEFAULT FALSE,
    available_for_ml BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_results (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    risk_score DOUBLE PRECISION,
    risk_level VARCHAR(50),
    report_details TEXT,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_results (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    risk_score DOUBLE PRECISION,
    risk_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Flagged',
    report_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_members_2025_patient_id ON members_2025(patient_id);
CREATE INDEX IF NOT EXISTS idx_members_2025_classification ON members_2025(classification_status);
CREATE INDEX IF NOT EXISTS idx_members_2025_mapping_status ON members_2025(mapping_status);
"""

def init_members_2025_table():
    with engine.begin() as conn:
        conn.execute(text(CREATE_TABLES_SQL))
        conn.execute(text("ALTER TABLE members_2025 ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT 'NOT_REVIEWED';"))
        conn.execute(text("UPDATE members_2025 SET review_status = 'NOT_REVIEWED' WHERE review_status IS NULL;"))
        conn.execute(text("ALTER TABLE ml_results ADD COLUMN IF NOT EXISTS report_details TEXT;"))
        print("members_2025 table initialized.")
        print("ml_results and agent_results tables verified/created successfully.")

if __name__ == "__main__":
    init_members_2025_table()

