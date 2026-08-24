import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# AUTHENTICATION TEMPORARILY DISABLED FOR ML/AGENT INTEGRATION TESTING
# TODO: Re-enable authentication after ML/Agent integration is complete
# from app.api.auth import router as auth_router

from app.api.router import api_router
from app.api.auth import router as auth_router
from app.database.connection import engine
from app.database.init_db import init_members_2025_table

init_members_2025_table()

app = FastAPI(
    title="Risk Adjustment & HCC Assistant",
    description="Backend API for Medicare Advantage Risk Adjustment",
    version="1.0.0",
)
print("=== MAIN FASTAPI APP INITIALIZED WITH HCC ROUTER ===")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTHENTICATION TEMPORARILY DISABLED FOR ML/AGENT INTEGRATION TESTING
# TODO: Re-enable authentication after ML/Agent integration is complete
# app.include_router(auth_router, prefix="/api")

# All other v1 routes: /api/v1/dashboard/..., /api/v1/members/...
app.include_router(api_router)
app.include_router(auth_router, prefix="/api/auth")


@app.get("/")
def root():
    return {
        "message": "Risk Adjustment Backend API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }
