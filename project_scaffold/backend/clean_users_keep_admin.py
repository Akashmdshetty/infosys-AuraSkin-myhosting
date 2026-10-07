import logging
from app.db.session import SessionLocal
from app.models import User, RoleEnum
from app.services.admin_service import delete_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def remove_non_admin_users():
    db = SessionLocal()
    try:
        # Find all non-admin users
        non_admin_users = db.query(User).filter(User.role != RoleEnum.ADMIN).all()
        admin_users = db.query(User).filter(User.role == RoleEnum.ADMIN).all()

        print(f"Found {len(admin_users)} admin user(s) to keep:")
        for admin in admin_users:
            print(f"  - [KEEP] #{admin.id}: {admin.name} ({admin.email}) - {admin.role.value}")

        print(f"\nFound {len(non_admin_users)} non-admin user(s) to delete:")
        for u in non_admin_users:
            print(f"  - [DELETE] #{u.id}: {u.name} ({u.email}) - {u.role.value}")

        if not non_admin_users:
            print("\nNo non-admin users found in the database. Database already clean!")
            return

        deleted_count = 0
        for u in non_admin_users:
            user_id = u.id
            user_email = u.email
            try:
                delete_user(db, user_id)
                deleted_count += 1
                print(f"[SUCCESS] Deleted user #{user_id} ({user_email})")
            except Exception as e:
                print(f"[ERROR] Failed to delete user #{user_id} ({user_email}): {e}")

        # Final verification
        remaining_users = db.query(User).all()
        print(f"\nCleanup complete! Total remaining users in database: {len(remaining_users)}")
        for rem in remaining_users:
            print(f"  - #{rem.id}: {rem.name} ({rem.email}) - {rem.role.value}")

    finally:
        db.close()

if __name__ == '__main__':
    remove_non_admin_users()
