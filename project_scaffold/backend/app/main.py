import time
import uuid
import logging
from datetime import datetime
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db.base import Base
import app.models

# Initialize new tables if not yet existing (idempotent & non-destructive)
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

def seed_admin_accounts():
    """Auto-seed default and configured administrator accounts if not yet created."""
    db = SessionLocal()
    try:
        from app.core.security import get_password_hash
        from app.models.user import RoleEnum, User

        target_email = settings.ADMIN_EMAIL.strip().lower()
        target_password = settings.ADMIN_PASSWORD
        target_name = settings.ADMIN_NAME

        # Clean up legacy default demo admin accounts if present
        legacy_admins = ["admin@auraskin.ai", "admin@example.com"]
        for legacy_email in legacy_admins:
            if legacy_email.lower() != target_email:
                leg_user = db.query(User).filter(User.email.ilike(legacy_email)).first()
                if leg_user:
                    db.delete(leg_user)
                    db.commit()
                    logging.getLogger("auraskin.api").info("Removed legacy admin account: %s", legacy_email)

        # Seed or update the primary administrator
        existing = db.query(User).filter(User.email.ilike(target_email)).first()
        if not existing:
            new_admin = User(
                name=target_name,
                email=target_email,
                password_hash=get_password_hash(target_password),
                role=RoleEnum.ADMIN,
                email_verified=True,
                verification_status="VERIFIED"
            )
            db.add(new_admin)
            db.commit()
            logging.getLogger("auraskin.api").info("Auto-seeded admin account: %s", target_email)
        else:
            existing.password_hash = get_password_hash(target_password)
            existing.role = RoleEnum.ADMIN
            existing.verification_status = "VERIFIED"
            existing.email_verified = True
            db.commit()
            logging.getLogger("auraskin.api").info("Updated admin account credentials: %s", target_email)
    except Exception as e:
        logging.getLogger("auraskin.api").warning("Could not auto-seed admin accounts: %s", str(e))
    finally:
        db.close()

# Run admin seeding
try:
    seed_admin_accounts()
except Exception:
    pass

from app.api import (
    auth, users, skin_profile, lifestyle, sleep, hydration, environmental_exposure,
    admin, skin_intelligence, professional, ingredient_intelligence, product_intelligence,
    progress, notifications, reports
)

# Structured Logging Configuration
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [req_id=%(name)s] %(message)s"
)
logger = logging.getLogger("auraskin.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    version="4.0.0",
    docs_url="/docs" if settings.DEBUG or settings.ENVIRONMENT != "production" else "/docs",
    redoc_url="/redoc" if settings.DEBUG or settings.ENVIRONMENT != "production" else "/redoc",
)

@app.on_event("startup")
async def on_startup():
    try:
        seed_admin_accounts()
    except Exception:
        pass

# Correlation ID & Performance & Security Headers Middleware
@app.middleware("http")
async def request_lifecycle_middleware(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id

    try:
        response: Response = await call_next(request)
        process_time = (time.time() - start_time) * 1000

        # Correlation & Performance Headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"

        # Security Headers (Production Hardened)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Caching control on authenticated sensitive APIs
        if request.url.path.startswith("/api/auth") or request.url.path.startswith("/api/users"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

        if request.url.path not in ["/health", "/health/live", "/api/health"]:
            logger.info(
                "[%s] %s %s -> %s (%.2fms)",
                request_id[:8],
                request.method,
                request.url.path,
                response.status_code,
                process_time
            )
        return response

    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            "[%s] Unhandled Exception on %s %s after %.2fms: %s",
            request_id[:8],
            request.method,
            request.url.path,
            process_time,
            str(exc),
            exc_info=True
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An internal server error occurred. Please try again later.",
                    "request_id": request_id
                }
            },
            headers={
                "X-Request-ID": request_id,
                "X-Process-Time-Ms": f"{process_time:.2f}",
                "X-Content-Type-Options": "nosniff"
            }
        )

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time-Ms"]
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(skin_profile.router, prefix="/api/skin-profile", tags=["Skin Profile"])
app.include_router(lifestyle.router, prefix="/api/lifestyle", tags=["Lifestyle"])
app.include_router(sleep.router, prefix="/api/sleep", tags=["Sleep"])
app.include_router(hydration.router, prefix="/api/hydration", tags=["Hydration"])
app.include_router(environmental_exposure.router, prefix="/api/environmental-exposure", tags=["Environmental Exposure"])
app.include_router(skin_intelligence.router, prefix="/api/skin-intelligence", tags=["Skin Intelligence"])
app.include_router(professional.router, prefix="/api/professional", tags=["Professional"])
app.include_router(ingredient_intelligence.router, prefix="/api/ingredients", tags=["Ingredient Intelligence"])
app.include_router(product_intelligence.router, prefix="/api/products", tags=["Product Intelligence"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress & Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications & Reminders"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports & Export"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Health Check & Observability Probes
@app.get("/health", tags=["Health"])
async def health_check():
    """Simple backward-compatible health check."""
    return {"status": "ok"}

@app.get("/health/live", tags=["Health"])
async def liveness_probe():
    """Kubernetes / Container liveness probe confirming process vitality."""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.get("/health/ready", tags=["Health"])
async def readiness_probe():
    """Container readiness probe confirming database connectivity."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ready", "database": "connected", "timestamp": datetime.utcnow().isoformat() + "Z"}
    except Exception as e:
        logger.error("Readiness check failed: %s", str(e))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "disconnected", "error": "Database unreachable"}
        )

@app.get("/api/health", tags=["Health"])
async def api_operational_health():
    """Deep observability operational health check."""
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": "connected" if db_status == "connected" else "disconnected",
        "version": "4.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "auth": "operational",
            "scoring_engine": "operational",
            "intelligence": "operational",
            "notifications": "operational",
            "reports": "operational"
        }
    }
