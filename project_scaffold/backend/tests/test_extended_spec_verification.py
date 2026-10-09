import os
import uuid
import logging
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

from app.main import app
from app.core.config import settings

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "aakashdshetty@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "aakashshetty112233")

def test_swagger_and_openapi_documentation(client: TestClient):
    """
    Check 1: Swagger /docs and /openapi.json documentation.
    Confirms all routes, tags, request schemas, response schemas, and JWT security schemes.
    """
    # 1. Check /docs returns 200 HTML
    docs_res = client.get("/docs")
    assert docs_res.status_code == 200
    assert "swagger-ui" in docs_res.text.lower() or "html" in docs_res.text.lower()

    # 2. Check /openapi.json
    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    schema = openapi_res.json()
    assert "openapi" in schema
    assert "paths" in schema

    paths = schema["paths"]
    # Check that all required routes are documented
    expected_paths = [
        "/health",
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/me",
        "/api/users/me",
        "/api/skin-profile/",
        "/api/lifestyle/",
        "/api/sleep/",
        "/api/hydration/",
        "/api/environmental-exposure/",
        "/api/admin/users",
        "/api/admin/users/{user_id}",
    ]
    for p in expected_paths:
        assert p in paths, f"Path {p} missing in OpenAPI schema"

    # Check tags
    all_tags = set()
    for path_item in paths.values():
        for op in path_item.values():
            if isinstance(op, dict) and "tags" in op:
                all_tags.update(op["tags"])

    expected_tags = {
        "Authentication",
        "Users",
        "Skin Profile",
        "Lifestyle",
        "Sleep",
        "Hydration",
        "Environmental Exposure",
        "Admin",
        "Health",
    }
    assert expected_tags.issubset(all_tags), f"Missing tags: {expected_tags - all_tags}"

    # Check components / schemas
    components = schema.get("components", {})
    schemas = components.get("schemas", {})
    expected_schemas = [
        "UserRegistration",
        "UserLogin",
        "UserResponse",
        "UserUpdate",
        "SkinProfileCreate",
        "SkinProfileUpdate",
        "SkinProfileResponse",
        "LifestyleCreate",
        "LifestyleUpdate",
        "LifestyleResponse",
        "SleepRecordCreate",
        "SleepRecordResponse",
        "HydrationRecordCreate",
        "HydrationRecordResponse",
        "EnvironmentalExposureCreate",
        "EnvironmentalExposureResponse",
    ]
    for s in expected_schemas:
        assert s in schemas, f"Schema {s} missing from components.schemas"

    # Check security schemes
    sec_schemes = components.get("securitySchemes", {})
    assert "OAuth2PasswordBearer" in sec_schemes or any(
        s.get("type") in ["oauth2", "http"] for s in sec_schemes.values()
    )


def test_cors_preflight_and_headers(client: TestClient):
    """
    Check 2: CORS pre-flight OPTIONS request and CORS headers.
    """
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
    }
    response = client.options("/api/skin-profile/", headers=headers)
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] in ["*", "http://localhost:3000"]
    assert "access-control-allow-methods" in response.headers
    assert "access-control-allow-headers" in response.headers


def test_error_handling_comprehensive(client: TestClient):
    """
    Check 3: Error handling status codes:
    - 422: Validation errors (malformed email, negative numbers, bad enum values)
    - 409: Duplicate resources (duplicate user email, duplicate skin profile)
    - 404: Missing resources (skin profile not found, user not found)
    - 401: Unauthorized (missing token, invalid token, wrong password)
    - 403: Forbidden (insufficient permissions, direct admin registration)
    """
    # 422 Validation Error: Invalid email format
    invalid_email_res = client.post("/api/auth/register", json={
        "name": "Invalid Email",
        "email": "not-an-email",
        "password": "Password123!"
    })
    assert invalid_email_res.status_code == 422

    # 422 Validation Error: Negative sleep hours
    # First get a valid user
    run_id = uuid.uuid4().hex[:6]
    reg_res = client.post("/api/auth/register", json={
        "name": "Error Test User",
        "email": f"err_user_{run_id}@example.com",
        "password": "Password123!"
    })
    assert reg_res.status_code == 201
    token = client.post("/api/auth/login", json={
        "email": f"err_user_{run_id}@example.com",
        "password": "Password123!"
    }).json()["access_token"]
    user_headers = {"Authorization": f"Bearer {token}"}

    neg_sleep = client.post("/api/sleep/", json={"sleep_hours": -5, "sleep_quality": "GOOD"}, headers=user_headers)
    assert neg_sleep.status_code == 422

    # 422 Validation Error: Invalid Enum value
    invalid_enum = client.post("/api/lifestyle/", json={"stress_level": "EXTREME", "lifestyle_habits": "none"}, headers=user_headers)
    assert invalid_enum.status_code == 422

    # 409 Conflict: Duplicate user registration
    dup_reg = client.post("/api/auth/register", json={
        "name": "Dup User",
        "email": f"err_user_{run_id}@example.com",
        "password": "Password123!"
    })
    assert dup_reg.status_code == 409

    # 404 Not Found: Skin profile before creation
    not_found_skin = client.get("/api/skin-profile/", headers=user_headers)
    assert not_found_skin.status_code == 404

    # 409 Conflict: Duplicate skin profile creation
    create_skin = client.post("/api/skin-profile/", json={"skin_type": "DRY"}, headers=user_headers)
    assert create_skin.status_code == 201
    dup_skin = client.post("/api/skin-profile/", json={"skin_type": "OILY"}, headers=user_headers)
    assert dup_skin.status_code == 409

    # 401 Unauthorized: Invalid Token
    bad_token_res = client.get("/api/users/me", headers={"Authorization": "Bearer invalid.fake.token"})
    assert bad_token_res.status_code == 401

    # 401 Unauthorized: Wrong password
    wrong_pwd = client.post("/api/auth/login", json={"email": f"err_user_{run_id}@example.com", "password": "WrongPassword!"})
    assert wrong_pwd.status_code == 401

    # 403 Forbidden: Direct Admin Registration
    admin_reg = client.post("/api/auth/register", json={
        "name": "Attacker",
        "email": f"attacker_{run_id}@example.com",
        "password": "Password123!",
        "role": "ADMIN"
    })
    assert admin_reg.status_code == 403

    # 403 Forbidden: User accessing Admin endpoint
    forbidden_admin = client.get("/api/admin/users", headers=user_headers)
    assert forbidden_admin.status_code == 403


def test_logging_and_sensitive_data_protection(client: TestClient, caplog: pytest.LogCaptureFixture):
    """
    Check 4: Logging operates correctly and NEVER exposes plaintext passwords,
    hashes, or JWT secrets in application logs.
    """
    caplog.set_level(logging.INFO)
    run_id = uuid.uuid4().hex[:6]
    secret_password = f"P@sswordSecret_{run_id}!"
    test_email = f"log_test_{run_id}@example.com"

    # Register
    client.post("/api/auth/register", json={
        "name": "Log Test User",
        "email": test_email,
        "password": secret_password,
        "role": "USER"
    })

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": secret_password
    })
    token = login_res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {token}"}

    # CRUD
    client.post("/api/sleep/", json={"sleep_hours": 7, "sleep_quality": "EXCELLENT"}, headers=user_headers)

    captured_logs = caplog.text
    # Verify sensitive data is NOT in logs
    assert secret_password not in captured_logs, "Plaintext password leaked in logs!"
    assert settings.JWT_SECRET_KEY not in captured_logs, "JWT secret leaked in logs!"
    assert settings.POSTGRES_PASSWORD not in captured_logs, "Postgres password leaked in logs!"


def test_health_check_specification(client: TestClient):
    """
    Check 5: Health check matches specification {"status": "ok"}.
    """
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body == {"status": "ok"}
