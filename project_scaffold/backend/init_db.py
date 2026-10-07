import os
from app.core.config import settings
from sqlalchemy import create_engine
from app.db.base import Base
import app.models

engine = create_engine(settings.DATABASE_URL)

def init_db():
    print("Re-creating database tables with updated Milestone 2 schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

    # Re-seed admin user
    try:
        from seed_admin import seed_admin
        seed_admin()
    except Exception as e:
        print(f"Warning re-seeding admin: {e}")

if __name__ == '__main__':
    init_db()

