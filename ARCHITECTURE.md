# System Architecture

```mermaid
flowchart TB

    %% =========================================================
    %% INPUT LAYER
    %% =========================================================

    subgraph INPUT["INPUT LAYER"]
        LOGIN["Login / Dashboard"]
        MEMBERS["Patient / Member List"]
        DOCS["Patient Data & Medical Documents"]
    end

    LOGIN --> MEMBERS
    MEMBERS --> DOCS


    %% =========================================================
    %% DATA PREPROCESSING
    %% =========================================================

    subgraph PREPROCESSING["DATA PREPROCESSING LAYER"]
        COLLECTION["Data Collection"]
        CLEANING["Data Cleaning & Preprocessing"]
        FEATURES["Feature Engineering"]
        STRUCTURED["Structured Patient Data"]
    end

    DOCS --> COLLECTION
    COLLECTION --> CLEANING
    CLEANING --> FEATURES
    FEATURES --> STRUCTURED


    %% =========================================================
    %% RULE ENGINE
    %% =========================================================

    subgraph RULES["RULE-BASED VALIDATION ENGINE"]
        VALIDATION["Patient & Documentation Validation"]
    end

    STRUCTURED --> VALIDATION


    %% =========================================================
    %% ANALYSIS BRANCHES
    %% =========================================================

    subgraph ANALYSIS["AUTOMATED ANALYSIS"]
        
        subgraph ML["UNFLAGGED • PROPER DOCUMENTATION"]
            PATTERN["Pattern Detection"]
            THRESHOLD["Threshold Evaluation"]
            SEVERITY["Severity Ranking"]
            ML_RISK["Risk Score & Prioritization"]

            PATTERN --> THRESHOLD
            THRESHOLD --> SEVERITY
            SEVERITY --> ML_RISK
        end

        subgraph AI["FLAGGED • MISSING DOCUMENTATION"]
            MISSING["Missing Document Validation"]
            HCC["Pattern & HCC / ICD Analysis"]
            CITATION["Citation Service"]
            AI_RISK["Risk Service"]

            MISSING --> HCC
            HCC --> CITATION
            CITATION --> AI_RISK
        end
    end

    VALIDATION -->|Proper Documentation| PATTERN
    VALIDATION -->|Missing / Insufficient Documentation| MISSING


    %% =========================================================
    %% EXPLANATION
    %% =========================================================

    subgraph EXPLANATION["EXPLANATION SERVICES"]
        SUMMARY["Analysis Summary"]
        EVIDENCE["Supporting Evidence"]
        REASONING["Risk & Decision Explanation"]
    end

    ML_RISK --> SUMMARY
    AI_RISK --> SUMMARY

    SUMMARY --> EVIDENCE
    EVIDENCE --> REASONING


    %% =========================================================
    %% HUMAN REVIEW
    %% =========================================================

    subgraph HUMAN["HUMAN-IN-THE-LOOP REVIEW"]
        REVIEWER["Human Reviewer"]

        APPROVE["Approve"]
        REJECT["Reject"]
        REVIEW["Mark for Review"]

        APPROVED["Approved Cases"]
        FEEDBACK["Feedback / Rule Updates"]
        REVIEW_CASES["Review Cases"]
        LATER["Saved for Later Review"]
    end

    REASONING --> REVIEWER

    REVIEWER --> APPROVE
    REVIEWER --> REJECT
    REVIEWER --> REVIEW

    APPROVE --> APPROVED
    REJECT --> FEEDBACK
    REVIEW --> REVIEW_CASES
    REVIEW_CASES --> LATER


    %% =========================================================
    %% CONTINUOUS IMPROVEMENT
    %% =========================================================

    subgraph IMPROVEMENT["CONTINUOUS IMPROVEMENT"]
        RULE_UPDATE["Validation Rules"]
        MODEL_UPDATE["ML / AI Improvements"]
    end

    FEEDBACK --> RULE_UPDATE
    FEEDBACK --> MODEL_UPDATE

    RULE_UPDATE -.-> VALIDATION
    MODEL_UPDATE -.-> ML
    MODEL_UPDATE -.-> AI


    %% =========================================================
    %% STYLING
    %% =========================================================

    classDef input fill:#E8F1FF,stroke:#2563EB,stroke-width:2px,color:#111827;
    classDef preprocessing fill:#EEFDF5,stroke:#16A34A,stroke-width:2px,color:#111827;
    classDef rules fill:#FFF7E6,stroke:#D97706,stroke-width:2px,color:#111827;
    classDef ml fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#111827;
    classDef ai fill:#FCE7F3,stroke:#DB2777,stroke-width:2px,color:#111827;
    classDef explanation fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#111827;
    classDef human fill:#F0FDFA,stroke:#0F766E,stroke-width:2px,color:#111827;
    classDef improvement fill:#F3F4F6,stroke:#4B5563,stroke-width:2px,color:#111827;

    class LOGIN,MEMBERS,DOCS input;
    class COLLECTION,CLEANING,FEATURES,STRUCTURED preprocessing;
    class VALIDATION rules;
    class PATTERN,THRESHOLD,SEVERITY,ML_RISK ml;
    class MISSING,HCC,CITATION,AI_RISK ai;
    class SUMMARY,EVIDENCE,REASONING explanation;
    class REVIEWER,APPROVE,REJECT,REVIEW,APPROVED,FEEDBACK,REVIEW_CASES,LATER human;
    class RULE_UPDATE,MODEL_UPDATE improvement;
