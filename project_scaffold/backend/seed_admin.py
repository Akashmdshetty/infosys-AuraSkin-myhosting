import os
from dotenv import load_dotenv
from app.db.session import SessionLocal
from app.models import User, RoleEnum
from app.core.security import get_password_hash

load_dotenv()

ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise RuntimeError('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')

def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            existing.password_hash = get_password_hash(ADMIN_PASSWORD)
            existing.role = RoleEnum.ADMIN
            db.commit()
            print(f'Admin user ({ADMIN_EMAIL}) updated successfully.')
            return
        admin_user = User(
            name='Aakash Shetty (Admin)',
            email=ADMIN_EMAIL,
            password_hash=get_password_hash(ADMIN_PASSWORD),
            role=RoleEnum.ADMIN,
        )
        db.add(admin_user)
        db.commit()
        print(f'Admin user ({ADMIN_EMAIL}) created successfully.')
    finally:
        db.close()

if __name__ == '__main__':
    seed_admin()
