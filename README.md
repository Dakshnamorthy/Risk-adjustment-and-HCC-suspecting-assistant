# CTS HCC Assistant

CTS HCC Assistant is a full-stack healthcare risk-adjustment application for Medicare Advantage workflows. It combines a React/Vite operations dashboard with a FastAPI backend that loads clinical records into PostgreSQL, maps ICD-10 diagnoses to HCC codes, classifies members, and sends classified members to external ML or agent pipelines.

> **Important:** This application handles sensitive healthcare data. The repository is a development and integration project, not a production HIPAA-compliant deployment. Review the security checklist before using real patient data.

## What The Application Does

The primary workflow is:

1. Sign in through the session-based authentication API.
2. Upload a 2025 clinical CSV from **HCC Mapping**.
3. Validate the CSV and map each `ICD10_Code` to an HCC code with `hccinfhir`.
4. Store or update the records in PostgreSQL.
5. Send the current upload to the classification pipeline.
6. Route `FLAGGED` members to the agent workflow and `UNFLAGGED` members to the ML workflow.
7. Persist returned risk scores, risk levels, and reports for review in the dashboard.

The dashboard also provides member search, patient history, review decisions, workflow queues, reports, analytics, and cost estimation views.

## Current Implementation Status

### Connected to the backend

- Login, logout, and session checks using an HTTP-only `cts_session` cookie
- Dashboard counts from PostgreSQL
- Paginated member directory with age, sex, classification, review, and patient-ID filters
- Patient history lookup
- Mark-for-review and accept/reject decisions
- CSV upload and ICD-10-to-HCC mapping
- Mapping results and mapping statistics
- Classification through the external pipeline
- Agent and ML assignment through the external pipeline
- Persisted `agent_results` and `ml_results` records

### Still mock or partially integrated

- **Analytics** currently calculates charts from constants in `frontend/src/pages/Analytics.jsx`.
- **Estimation** currently calculates funding and cost figures from constants in `frontend/src/pages/Estimation.jsx`.
- Some navigation entries are legacy links without matching routes.
- The external classification, ML, and agent pipeline must be available for those workflow actions to succeed.

## Technology Stack

### Backend

- Python 3.11+
- FastAPI 0.141.1
- Uvicorn
- SQLAlchemy 2.0
- PostgreSQL through `psycopg2-binary`
- Pydantic 2
- pandas for CSV parsing
- `hccinfhir` 0.3.3 for HCC mapping
- `httpx` for external pipeline requests
- `python-dotenv` for environment configuration

### Frontend

- React 18
- Vite 5
- React Router 6
- Recharts
- Lucide React
- Framer Motion
- Tailwind CSS 3
- date-fns

## Architecture

```text
Browser
  |
  | React pages and apiService.js
  v
Vite dev server: http://localhost:3000
  |
  | HTTP/JSON with credentials included
  v
FastAPI: http://localhost:8000
  |
  +-- API routers: backend/app/api
  +-- Pydantic schemas: backend/app/schemas
  +-- Services: backend/app/services
  +-- Repositories: backend/app/repositories
  v
PostgreSQL
  |
  +-- members_2025
  +-- member_review_status
  +-- ml_results
  +-- agent_results
  +-- users
  +-- auth_sessions

External pipeline
  ^
  | Classification, agent, and ML requests
  +-- NGROK_PIPELINE_URL
```

The backend creates or verifies its core tables when `backend/main.py` starts. Database connection settings are loaded from `backend/.env`.

## Requirements

- Windows, macOS, or Linux
- Python 3.11 or newer
- Node.js 18 or newer and npm
- PostgreSQL 13+ or a reachable PostgreSQL-compatible instance
- A database user that can create and alter the application tables
- Network access to the configured external pipeline when classification or ML/agent actions are used

## Configuration

### Backend environment

Create `backend/.env` and provide values for the database used by this checkout:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=riskadjustment
DB_USER=postgres
DB_PASSWORD=change-me

# Required for classification, agent assignment, and ML assignment
NGROK_PIPELINE_URL=https://example.invalid/run-pipeline
```

The backend reads this file relative to the repository, not from the current shell directory. Do not commit credentials or paste them into documentation. The checked-in local environment file contains deployment-specific secrets and should be rotated if it has ever been shared.

### Frontend environment

Create or update `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Vite exposes only variables prefixed with `VITE_` to browser code. Never place database credentials, pipeline credentials, or other secrets in this file.

For a deployed frontend, set `VITE_API_URL` in the frontend build environment to the public API origin and `/api/v1` path, for example `https://api.example.com/api/v1`, before running `npm run build`. Vite embeds this value into the generated JavaScript; changing it after the build does not update an already deployed bundle.

Set `CORS_ORIGINS` in the backend environment to the exact deployed frontend origin, for example `https://app.example.com`. For separate cross-site HTTPS frontend and API origins, also set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` so the session cookie is accepted and sent by the browser.

### Authentication behavior

The frontend calls `/api/auth/me` on startup. If no valid session exists, it redirects to `/login`. Login sets an HTTP-only `cts_session` cookie for up to eight hours. The frontend sends requests with `credentials: 'include'`.

The `/api/v1` router applies `require_auth`, so all dashboard, member, HCC, and ML/agent API calls require a valid session. Authentication is implemented in `backend/app/api/auth.py`, `backend/app/auth_dependencies.py`, and `backend/app/services/auth_service.py`.

## Local Setup

### Windows PowerShell

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend opens at [http://localhost:3000](http://localhost:3000). The API is at [http://localhost:8000](http://localhost:8000).

### macOS or Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### Repository scripts

The repository also contains platform-specific setup/start scripts under `backend/` and `frontend/`, plus `test_integration.bat` and `test_integration.sh` when those files are present in your checkout. The explicit commands above are the authoritative fallback because they show the required working directories and environment activation.

## Verify The Installation

Open the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

Unauthenticated health checks:

```powershell
curl http://localhost:8000/
curl http://localhost:8000/health
curl http://localhost:8000/db-test
```

Expected responses include:

```json
{"status":"healthy"}
```

```json
{"database":"connected","result":1}
```

Protected endpoints require a session cookie. Use the frontend login flow or authenticate with a client that preserves cookies before requesting `/api/v1/*` endpoints.

Build the frontend before deployment:

```bash
cd frontend
npm run build
npm run preview
```

## API Reference

The main API prefix is `/api/v1`. The HCC endpoints are also available under the compatibility prefix `/api/v1/hcc-map`.

### Authentication

These routes are mounted under `/api/auth` and are not part of the `/api/v1` protected router.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Validate credentials and set the `cts_session` cookie |
| POST | `/api/auth/logout` | Revoke the current session and clear the cookie |
| GET | `/api/auth/me` | Return the authenticated user |

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Backend status message |
| GET | `/health` | Process health check |
| GET | `/db-test` | Execute `SELECT 1` against PostgreSQL |

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/dashboard/summary` | Counts members by classification and review outcome; optional `year` |
| GET | `/api/v1/dashboard/accepted-members` | Paginated accepted decisions; `page`, `page_size` |
| GET | `/api/v1/dashboard/rejected-members` | Paginated rejected decisions; `page`, `page_size` |

Summary response:

```json
{
  "total_members": 0,
  "flagged_members": 0,
  "unflagged_members": 0,
  "review_cases": 0,
  "follow_ups": 0,
  "accepted_members": 0,
  "rejected_members": 0
}
```

### Members and review

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/members` | Paginated directory; supports `page`, `page_size`, `patient_id`, `flag_status`, `review_status`, `sex`, `min_age`, and `max_age` |
| GET | `/api/v1/members/{patient_id}` | Complete patient history grouped by year |
| POST | `/api/v1/members/{patient_id}/mark-for-review` | Set `review_status` to `REVIEWED` |
| POST | `/api/v1/members/{patient_id}/decision` | Record `ACCEPTED` or `REJECTED` decision from `AGENT` or `ML` |

Decision request body:

```json
{
  "status": "ACCEPTED",
  "source": "AGENT"
}
```

### HCC mapping and classification

Each endpoint below is also available with `/hcc-map` replacing `/hcc-mapping`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/hcc-mapping/upload` | Upload, validate, map, and upsert a CSV |
| GET | `/api/v1/hcc-mapping/results` | Paginated mapping records; supports `page`, `page_size`, `mapping_status`, and `patient_id` |
| GET | `/api/v1/hcc-mapping/stats` | Mapping, code, and classification totals |
| POST | `/api/v1/hcc-mapping/classify-members` | Send the current upload to the classification pipeline |
| POST | `/api/v1/hcc-mapping/assign-for-agent` | Send classified flagged members to the agent pipeline |
| POST | `/api/v1/hcc-mapping/assign-for-ml` | Send classified unflagged members to the ML pipeline |

The upload response includes `total_records`, `mapped_records`, `unmapped_records`, and a record preview. Mapping normalizes ICD-10 codes by trimming whitespace, uppercasing, and removing dots before calling `hccinfhir`.

### ML and agent results

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/ml-agent/flagged-members` | Paginated agent results; supports `page` and `limit` |
| GET | `/api/v1/ml-agent/unflagged-members` | Paginated ML results; supports `page` and `limit` |

External pipeline responses are stored as JSON report details. The frontend supports summary, risk assessment, explanations, recommendations, citations, risk score, and risk level fields when present.

## CSV Upload Contract

The upload must be a non-empty `.csv` file containing these 27 headers. Header matching is case-insensitive and whitespace-tolerant, but the logical names must be present:

```text
Patient_ID
Age
Sex
Year
Number_of_Encounters
Number_of_Diagnoses
Chronic_Condition_Count
Unique_ICD10_Count
Repeated_Diagnosis_Count
Recent_Encounter_Count
Specialist_Encounter_Count
Hospitalization_History
Encounter_Type
Claim_Frequency
Disease_Description
Diagnosis_Frequency
Diagnosis_Recency_Days
Provider_Count
Claim_Count
ICD10_Code
Diagnosis_Seen_Repeatedly_Over_12_Months
Claim_Type
Provider_ID
Number_of_Encounters_Associated_With_Diagnosis
Diagnosis_Seen_Once
Diagnosis_Seen_5_Times
```

`ICD10_Code` is explicitly required. Missing headers, an empty file, invalid CSV syntax, or no data rows return a client error. Numeric fields are converted defensively; missing age and year values default to 65 and 2025 respectively. Uploading a file marks previous records as not current, then upserts the new records by `patient_id`.

Sample datasets in this checkout include [hcc_4.csv](hcc_4.csv), [frontend/flag_unflagged_dataset.csv](frontend/flag_unflagged_dataset.csv), and the patient risk dataset files under `backend/` and `frontend/`.

## Frontend Routes

| Path | Screen | Data status |
| --- | --- | --- |
| `/login` | Login | Backend session API |
| `/dashboard` | Dashboard KPIs and charts | PostgreSQL-backed KPIs |
| `/members` | Members directory | Backend API |
| `/member-360` | Patient history | Backend API |
| `/analytics` | Analytics and reports | Mock constants |
| `/hcc-mapping` | Upload, mapping, classification, assignment | Backend API and pipeline |
| `/ml-prediction` | ML results and reports | Backend API and pipeline |
| `/unflagged-members` | Unflagged member workflow | Related workflow screen |
| `/flagged-members` | Flagged member workflow | Related workflow screen |
| `/agent-analysis` | Agent results and reports | Backend API and pipeline |
| `/estimation` | Cost estimation | Mock constants |

Routing is defined in `frontend/src/App.jsx`. API calls are centralized in `frontend/src/services/apiService.js`. Shared layout components are in `frontend/src/components/`.

## Database Schema

Startup initialization in `backend/app/database/init_db.py` creates or verifies:

- `members_2025`: demographics, encounter features, ICD-10/HCC mapping, classification, review, and workflow flags
- `ml_results`: ML risk score, risk level, model version, and report details
- `agent_results`: agent risk score, risk level, status, and report details
- `auth_sessions`: hashed session tokens, expiry, revocation, and user references
- Indexes on member patient ID, classification status, and mapping status

The authentication implementation also expects an existing `users` table. The review workflow expects a `member_review_status` table with decision status and source columns. Ensure those tables exist in the target database before using login or decision endpoints.

## Testing

Run backend tests from the backend directory:

```bash
cd backend
python -m pytest
```

Some tests are environment-dependent and need PostgreSQL records or a reachable external pipeline. The standalone `backend/test_db.py` is a direct database inspection script and should only be run after replacing its connection approach with environment-based credentials; never add its credentials to source control.

For a quick live check after starting the backend, verify `/health`, `/db-test`, then log in through the frontend and verify `/api/v1/dashboard/summary`.

## Troubleshooting

### Backend exits while starting

The application initializes database tables during import. Check `backend/.env`, PostgreSQL availability, host/port reachability, and database permissions.

### API returns `401 Authentication required`

Log in through `/login`, confirm the browser accepts the `cts_session` cookie, and keep the frontend and backend origins aligned with the CORS list in `backend/main.py`.

### Classification or assignment returns a pipeline error

Confirm that `NGROK_PIPELINE_URL` is set, reachable from the backend machine, and accepts the payload containing `patient_ids`, `records`, and `destination`. The request timeout is 120 seconds.

### CSV upload is rejected

Confirm the file extension is `.csv`, the file contains rows, and all 27 required headers are present. Column names are compared case-insensitively, but spelling and underscores still matter.

### Port 3000 is already in use

Run Vite on another port:

```bash
npm run dev -- --port 3001
```

Add that origin to the backend CORS configuration if browser requests are blocked.

## Security And Production Checklist

Before any production or real-data deployment:

1. Rotate any database password that has been exposed and load secrets from a managed secret store.
2. Enforce HTTPS and set the session cookie `secure=True`.
3. Configure explicit trusted CORS origins; do not use wildcard origins with credentials.
4. Enforce authentication and authorization for every data and workflow operation.
5. Add upload size limits, content validation, rate limits, and external-request controls.
6. Add audit logging for patient access, uploads, classifications, assignments, and decisions.
7. Protect report downloads and ensure generated reports do not leak data across users.
8. Review retention, encryption, backups, access controls, and HIPAA obligations with the responsible security team.
9. Replace mock analytics and estimation data with verified backend data before presenting those screens as operational metrics.

## Project Layout

```text
cts_proj/
├── backend/
│   ├── main.py                 # FastAPI application and middleware
│   ├── requirements.txt        # Python dependencies
│   ├── app/
│   │   ├── api/                # Route modules and router registration
│   │   ├── database/           # Engine, sessions, and table initialization
│   │   ├── models/             # Model package
│   │   ├── repositories/       # PostgreSQL queries and mutations
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── services/           # Business and integration logic
│   ├── deploy/                 # Deployment-related files
│   └── test_*.py               # Backend checks and fixtures
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared layout and navigation
│   │   ├── pages/              # Routed application screens
│   │   ├── services/           # API client
│   │   └── App.jsx             # Browser routes and auth gate
│   ├── package.json            # npm scripts and dependencies
│   └── vite.config.js          # Vite server configuration
├── hcc_4.csv                  # Root sample CSV
├── test.py                    # Root-level project check
├── ARCHITECTURE.md            # Architecture notes file
├── WORK_COMPLETED.md          # Historical implementation summary
└── README.md                 # This guide
```

The local `myenv/` directory is a Python virtual environment and is not application source. `node_modules/` and `frontend/dist/` are generated frontend artifacts.

## Related Documentation

- [WORK_COMPLETED.md](WORK_COMPLETED.md) contains the historical integration summary and earlier verification notes.
- [ARCHITECTURE.md](ARCHITECTURE.md) is reserved for expanded architecture notes.
- [frontend/README.md](frontend/README.md) contains frontend-specific notes, but parts of it describe an earlier UI and should be treated as historical rather than authoritative.