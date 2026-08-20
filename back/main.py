from fastapi import FastAPI

from database import Base, engine
from auth.models import User  # needed so the table gets created
from auth.routes import router as auth_router

app = FastAPI()

# Create all DB tables (like "users") if they don't already exist
Base.metadata.create_all(bind=engine)

# Plug in the login route
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Backend is running"}