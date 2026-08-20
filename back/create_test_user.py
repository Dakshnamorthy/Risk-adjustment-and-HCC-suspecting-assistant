from database import SessionLocal, Base, engine
from auth.models import User
from auth.utils import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

test_user = User(
    user_id="testuser",
    password_hash=hash_password("test123"),
    role="reviewer"
)

db.add(test_user)
db.commit()
db.close()

print("Test user created: user_id=testuser, password=test123")