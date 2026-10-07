import os
import uuid
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

from app.main import app
from app.db.session import SessionLocal
from app.models import User, Product, SkincareRoutine, RoutineAdherenceRecord, ProgressRecord

load_dotenv()

@pytest.fixture
def client():
    return TestClient(app)

def create_user_with_routine(client: TestClient, skin_type="COMBINATION", allergies="Salicylic Acid"):
    run_id = uuid.uuid4().hex[:6]
    email = f"flagship_{run_id}@example.com"
    password = "FlagshipPassword123!"

    # 1. Register & Login
    client.post("/api/auth/register", json={
        "name": f"Flagship User {run_id}",
        "email": email,
        "password": password,
        "role": "USER"
    })
    token = client.post("/api/auth/login", json={"email": email, "password": password}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Skin profile
    client.post("/api/skin-profile/", json={
        "skin_type": skin_type,
        "skin_concerns": ["Acne", "Redness"],
        "allergies": allergies,
        "sensitivities": "Retinoids"
    }, headers=headers)

    # 3. Generate initial routine
    client.get("/api/skin-intelligence/routine/current", headers=headers)

    return email, token, headers


def test_flagship_add_product_to_routine_success(client: TestClient):
    _, _, headers = create_user_with_routine(client, skin_type="DRY", allergies="")
    # Find a safe ceramide moisturizer
    prods = client.get("/api/products", headers=headers).json()
    ceramide_prod = next(p for p in prods if "Ceramide" in p["name"])

    add_res = client.post(
        f"/api/products/{ceramide_prod['id']}/add-to-routine",
        json={"time_of_day": "BOTH"},
        headers=headers
    )
    assert add_res.status_code == 200
    data = add_res.json()
    assert "Successfully integrated" in data["message"]
    assert data["product_id"] == ceramide_prod["id"]

    # Verify that the current routine now reflects the added product
    routine_res = client.get("/api/skin-intelligence/routine/current", headers=headers)
    assert routine_res.status_code == 200
    routine_data = routine_res.json()

    # Check that product appears in morning and evening routines
    am_types = [s["product_type"] for s in routine_data["morning_routine"]]
    pm_types = [s["product_type"] for s in routine_data["evening_routine"]]
    assert any(ceramide_prod["name"] in t for t in am_types)
    assert any(ceramide_prod["name"] in t for t in pm_types)


def test_flagship_add_allergen_product_blocked(client: TestClient):
    _, _, headers = create_user_with_routine(client, skin_type="OILY", allergies="Salicylic Acid")
    prods = client.get("/api/products", headers=headers).json()
    bha_prod = next(p for p in prods if "Salicylic Acid" in p["name"])

    # Attempting to add contraindicated product must fail with 400
    add_res = client.post(
        f"/api/products/{bha_prod['id']}/add-to-routine",
        json={"time_of_day": "AM"},
        headers=headers
    )
    assert add_res.status_code == 400
    assert "allergen conflict" in add_res.json()["detail"].lower()


def test_flagship_inci_scanner_4tier_classification(client: TestClient):
    _, _, headers = create_user_with_routine(client, allergies="Salicylic Acid", skin_type="SENSITIVE")

    # Formula with:
    # 1. Safe solvent: Aqua
    # 2. Known compatible active: Niacinamide
    # 3. Known sensitivity/caution: Retinol (Retinoids)
    # 4. Documented allergy conflict: Salicylic Acid
    # 5. Unknown exotic extract: DragonFruitSeedBioFermentExtract99
    formula = "Aqua, Niacinamide, Retinoids, Salicylic Acid, DragonFruitSeedBioFermentExtract99"

    res = client.post("/api/ingredients/analyze", json={"custom_formula_text": formula}, headers=headers)
    assert res.status_code == 200
    data = res.json()

    severities = {r["ingredient"].lower(): r["severity"] for r in data["results"]}

    # Aqua -> SAFE
    assert any("aqua" in k and v == "SAFE" for k, v in severities.items())
    # Niacinamide -> SAFE
    assert any("niacinamide" in k and v == "SAFE" for k, v in severities.items())
    # Salicylic Acid -> HIGH (Conflict)
    assert any("salicylic" in k and v == "HIGH" for k, v in severities.items())
    # Unknown -> UNKNOWN
    assert any("dragonfruit" in k and v == "UNKNOWN" for k, v in severities.items())


def test_flagship_routine_adherence_to_progress_flow(client: TestClient):
    _, _, headers = create_user_with_routine(client)

    # 1. Mark AM and PM steps complete
    adh_res = client.post("/api/progress/adherence", json={
        "morning_completed": True,
        "evening_completed": True,
        "completed_steps": ["Cleanser", "Hydrator", "Moisturizer", "SPF 50"],
        "notes": "Full day consistency achieved"
    }, headers=headers)
    assert adh_res.status_code == 200
    assert adh_res.json()["adherence_rate"] == 1.0

    # 2. Create progress snapshot
    snap_res = client.post("/api/progress/snapshot", json={
        "notes": "Snapshot after complete routine",
        "concern_levels": {"Acne": 1, "Redness": 1}
    }, headers=headers)
    assert snap_res.status_code == 201

    # 3. Trends reflects the data
    trends_res = client.get("/api/progress/trends", headers=headers)
    assert trends_res.status_code == 200
    trends = trends_res.json()
    assert trends["recent_adherence_rate"] == 1.0


def test_flagship_cross_user_routine_isolation(client: TestClient):
    _, _, headers1 = create_user_with_routine(client, skin_type="DRY")
    _, _, headers2 = create_user_with_routine(client, skin_type="OILY")

    prods = client.get("/api/products", headers=headers1).json()
    prod_a = prods[0]

    # User 1 adds product
    client.post(f"/api/products/{prod_a['id']}/add-to-routine", json={"time_of_day": "AM"}, headers=headers1)

    # User 2 routine should not be affected
    routine2 = client.get("/api/skin-intelligence/routine/current", headers=headers2).json()
    am_types2 = [s["product_type"] for s in routine2["morning_routine"]]
    assert not any(prod_a["name"] in t for t in am_types2)
