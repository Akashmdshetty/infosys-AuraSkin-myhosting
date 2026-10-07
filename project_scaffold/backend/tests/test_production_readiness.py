import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.db.session import engine

client = TestClient(app)

def test_liveness_probe():
    """Verify Kubernetes / Container liveness probe."""
    response = client.get("/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data

def test_readiness_probe():
    """Verify Container readiness probe with DB check."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert "timestamp" in data

def test_legacy_health_check_preserved():
    """Ensure backward compatibility for legacy /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_deep_observability_api_health():
    """Verify deep operational health endpoint with service statuses."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "4.0.0"
    assert data["services"]["auth"] == "operational"
    assert data["services"]["scoring_engine"] == "operational"

def test_request_correlation_id_generated():
    """Verify automatic X-Request-ID header generation when not supplied."""
    response = client.get("/health/live")
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) >= 8

def test_request_correlation_id_passthrough():
    """Verify client-supplied X-Request-ID is preserved and returned."""
    custom_id = "test-custom-trace-uuid-12345"
    response = client.get("/health/live", headers={"X-Request-ID": custom_id})
    assert response.headers["X-Request-ID"] == custom_id

def test_production_security_headers():
    """Verify presence of hardened security headers on API responses."""
    response = client.get("/health/live")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "SAMEORIGIN"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "X-Process-Time-Ms" in response.headers

def test_database_connection_pool_configuration():
    """Verify SQLAlchemy engine is configured with production connection pooling."""
    assert engine.pool is not None
    assert engine.pool.size() == settings.DATABASE_POOL_SIZE
    assert engine.pool._max_overflow == settings.DATABASE_MAX_OVERFLOW
    assert engine.pool._timeout == settings.DATABASE_POOL_TIMEOUT
    assert engine.pool._recycle == settings.DATABASE_POOL_RECYCLE

def test_cache_control_headers_on_auth():
    """Verify cache prevention headers on sensitive auth endpoints."""
    response = client.post("/api/auth/login", json={"email": "nonexistent@example.com", "password": "wrong"})
    assert "no-store" in response.headers.get("Cache-Control", "")
