from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ---- Database URL ----
# Using SQLite for now since you're on mock/local data.
# This creates a file called "app.db" in your project folder.
DATABASE_URL = "sqlite:///./app.db"

# ---- Engine ----
# check_same_thread=False is needed only for SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# ---- Session ----
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---- Base class ----
# All your models (like User) will inherit from this
Base = declarative_base()

# ---- Dependency for FastAPI routes ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()