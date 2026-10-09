import os
import uuid
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "aakashdshetty@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "aakashshetty112233")

RUN_ID = uuid.uuid4().hex[:6]
USER_A_EMAIL = f"alice_{RUN_ID}@example.com"
USER_B_EMAIL = f"user_b_{RUN_ID}@example.com"
CONSULTANT_EMAIL = f"bob_{RUN_ID}@example.com"
DERM_EMAIL = f"clara_{RUN_ID}@example.com"
TEMP_DELETE_EMAIL = f"temp_delete_{RUN_ID}@example.com"

# Shared state across sequential step verification
STATE = {}

def test_step_01_health_check(client: TestClient):
    """Step 1: Health check endpoint returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"


def test_step_02_register_client_user(client: TestClient):
    """Step 2: Public User Registration with role USER."""
    payload = {
        "name": "Alice Standard",
        "email": USER_A_EMAIL,
        "password": "Password123!",
        "role": "USER"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == USER_A_EMAIL
    assert data["role"] == "USER"
    assert "password_hash" not in data
    STATE["user_a_id"] = data["id"]


def test_step_03_register_consultant(client: TestClient):
    """Step 3: Public Consultant Registration with role SKINCARE_CONSULTANT."""
    payload = {
        "name": "Bob Consultant",
        "email": CONSULTANT_EMAIL,
        "password": "Password123!",
        "role": "SKINCARE_CONSULTANT"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "SKINCARE_CONSULTANT"
    assert "password_hash" not in data


def test_step_04_register_dermatologist(client: TestClient):
    """Step 4: Public Dermatologist Registration with role DERMATOLOGIST."""
    payload = {
        "name": "Dr. Clara Derm",
        "email": DERM_EMAIL,
        "password": "Password123!",
        "role": "DERMATOLOGIST"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "DERMATOLOGIST"
    assert "password_hash" not in data


def test_step_05_admin_registration_blocked(client: TestClient):
    """Step 5: Public Admin registration is blocked and forbidden."""
    payload = {
        "name": "Attacker Admin",
        "email": f"attacker_{RUN_ID}@example.com",
        "password": "Password123!",
        "role": "ADMIN"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 403


def test_step_06_user_login(client: TestClient):
    """Step 6: User Login returns access token."""
    payload = {
        "email": USER_A_EMAIL,
        "password": "Password123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    STATE["user_a_token"] = data["access_token"]


def test_step_07_invalid_login_rejected(client: TestClient):
    """Step 7: Invalid Login with wrong password is rejected."""
    payload = {
        "email": USER_A_EMAIL,
        "password": "WrongPassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


def test_step_08_get_user_profile(client: TestClient):
    """Step 8: Authenticated User Profile retrieval (GET /api/users/me)."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == USER_A_EMAIL
    assert "password_hash" not in data
    STATE["user_a_id"] = data["id"]


def test_step_09_update_user_profile(client: TestClient):
    """Step 9: User Profile update (PUT /api/users/me)."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {"name": "Alice Updated"}
    response = client.put("/api/users/me", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice Updated"


def test_step_10_unauthenticated_access_blocked(client: TestClient):
    """Step 10: Unauthenticated access to protected routes returns 401."""
    response = client.get("/api/users/me")
    assert response.status_code in [401, 403]
    response_profile = client.get("/api/skin-profile/")
    assert response_profile.status_code in [401, 403]


def test_step_11_create_skin_profile(client: TestClient):
    """Step 11: Skin Profile creation."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {
        "skin_type": "COMBINATION",
        "skin_concerns": ["ACNE", "DRYNESS"],
        "allergies": "Fragrance",
        "sensitivities": "Retinoids"
    }
    response = client.post("/api/skin-profile/", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["skin_type"] == "COMBINATION"


def test_step_12_get_skin_profile(client: TestClient):
    """Step 12: Skin Profile retrieval."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    response = client.get("/api/skin-profile/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["skin_type"] == "COMBINATION"
    assert "ACNE" in data["skin_concerns"]


def test_step_13_update_skin_profile(client: TestClient):
    """Step 13: Skin Profile update."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {
        "skin_type": "SENSITIVE",
        "skin_concerns": ["REDNESS", "ACNE"]
    }
    response = client.put("/api/skin-profile/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["skin_type"] == "SENSITIVE"
    assert "REDNESS" in data["skin_concerns"]


def test_step_14_lifestyle_tracking(client: TestClient):
    """Step 14: Lifestyle tracking create, retrieve, and update."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    # Create
    create_payload = {
        "lifestyle_habits": "Regular exercise, balanced diet",
        "stress_level": "MODERATE"
    }
    res_create = client.post("/api/lifestyle/", json=create_payload, headers=headers)
    assert res_create.status_code == 201

    # Get
    res_get = client.get("/api/lifestyle/", headers=headers)
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["stress_level"] == "MODERATE"

    # Update
    update_payload = {"stress_level": "LOW", "lifestyle_habits": "Yoga daily"}
    res_put = client.put("/api/lifestyle/", json=update_payload, headers=headers)
    assert res_put.status_code == 200
    assert res_put.json()["stress_level"] == "LOW"


def test_step_15_sleep_tracking(client: TestClient):
    """Step 15: Sleep record creation and retrieval."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {
        "sleep_hours": 8,
        "sleep_quality": "GOOD"
    }
    res_create = client.post("/api/sleep/", json=payload, headers=headers)
    assert res_create.status_code == 201
    assert res_create.json()["sleep_hours"] == 8

    res_list = client.get("/api/sleep/", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1


def test_step_16_hydration_tracking(client: TestClient):
    """Step 16: Hydration record creation and retrieval."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {
        "water_consumed": 2500,
        "humidity": 65
    }
    res_create = client.post("/api/hydration/", json=payload, headers=headers)
    assert res_create.status_code == 201
    assert res_create.json()["water_consumed"] == 2500

    res_list = client.get("/api/hydration/", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1


def test_step_17_environmental_exposure_tracking(client: TestClient):
    """Step 17: Environmental exposure creation and retrieval."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    payload = {
        "sun_exposure_hours": 3
    }
    res_create = client.post("/api/environmental-exposure/", json=payload, headers=headers)
    assert res_create.status_code == 201
    assert res_create.json()["sun_exposure_hours"] == 3

    res_list = client.get("/api/environmental-exposure/", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1


def test_step_18_cross_user_isolation(client: TestClient):
    """Step 18: Cross-user data isolation (User B cannot access or modify User A's data)."""
    # Register & login User B
    user_b_payload = {
        "name": "User B",
        "email": USER_B_EMAIL,
        "password": "Password123!",
        "role": "USER"
    }
    res_b_reg = client.post("/api/auth/register", json=user_b_payload)
    assert res_b_reg.status_code == 201

    login_res = client.post("/api/auth/login", json={"email": USER_B_EMAIL, "password": "Password123!"})
    assert login_res.status_code == 200
    user_b_token = login_res.json()["access_token"]
    user_b_headers = {"Authorization": f"Bearer {user_b_token}"}

    # User B should have 0 sleep records initially
    res = client.get("/api/sleep/", headers=user_b_headers)
    assert res.status_code == 200
    assert len(res.json()) == 0

    # User B should have 0 hydration records initially
    res_hyd = client.get("/api/hydration/", headers=user_b_headers)
    assert res_hyd.status_code == 200
    assert len(res_hyd.json()) == 0

    # User B skin profile should be 404 not found
    res_skin = client.get("/api/skin-profile/", headers=user_b_headers)
    assert res_skin.status_code == 404


def test_step_19_rbac_enforcement(client: TestClient):
    """Step 19: Role-based access control (Non-admin user cannot access Admin endpoints)."""
    headers = {"Authorization": f"Bearer {STATE['user_a_token']}"}
    response = client.get("/api/admin/users", headers=headers)
    assert response.status_code == 403


def test_step_20_admin_login_and_user_management(client: TestClient):
    """Step 20: Admin login and user list retrieval."""
    admin_login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    res = client.post("/api/auth/login", json=admin_login_payload)
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    STATE["admin_token"] = admin_token

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    users_res = client.get("/api/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 1
    # Ensure admin user has role ADMIN
    admin_obj = next((u for u in users if u["email"] == ADMIN_EMAIL), None)
    assert admin_obj is not None
    assert admin_obj["role"] == "ADMIN"


def test_step_21_admin_user_deletion(client: TestClient):
    """Step 21: Admin user deletion."""
    admin_headers = {"Authorization": f"Bearer {STATE['admin_token']}"}
    # Create a temporary user to delete
    temp_payload = {
        "name": "Temp Delete User",
        "email": TEMP_DELETE_EMAIL,
        "password": "Password123!",
        "role": "USER"
    }
    reg_res = client.post("/api/auth/register", json=temp_payload)
    assert reg_res.status_code == 201
    
    # List users to find temp user id
    users_res = client.get("/api/admin/users", headers=admin_headers)
    temp_user = next((u for u in users_res.json() if u["email"] == TEMP_DELETE_EMAIL), None)
    assert temp_user is not None
    temp_user_id = temp_user["id"]

    # Delete the user
    del_res = client.delete(f"/api/admin/users/{temp_user_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify deleted
    users_after = client.get("/api/admin/users", headers=admin_headers).json()
    assert not any(u["id"] == temp_user_id for u in users_after)
