import os
import uuid
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

from app.main import app
from app.db.session import SessionLocal
from app.models import (
    User, SkinProfile, LifestyleProfile, SleepRecord, HydrationRecord,
    EnvironmentalExposure, Product, ProductRecommendation, ProgressRecord, RoutineAdherenceRecord
)
from app.services.ingredient_intelligence_service import (
    get_all_ingredients_catalog, get_ingredient_by_name,
    analyze_ingredient_suitability, check_ingredient_interactions
)
from app.services.product_intelligence_service import (
    seed_products_if_empty, evaluate_product_suitability,
    get_product_recommendations, compare_products, get_alternative_products
)
from app.services.progress_tracking_service import (
    record_progress_snapshot, record_routine_adherence,
    get_progress_trends, get_before_after_comparison
)

load_dotenv()

@pytest.fixture
def client():
    return TestClient(app)

def create_authenticated_user(client: TestClient, role: str = "USER", skin_type: str = "NORMAL", allergies: str = "", sensitivities: str = ""):
    run_id = uuid.uuid4().hex[:6]
    email = f"m3_user_{run_id}@example.com"
    password = "TestPassword123!"

    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "name": f"M3 User {run_id}",
        "email": email,
        "password": password,
        "role": role
    })
    assert reg_res.status_code == 201

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Skin Profile
    prof_res = client.post("/api/skin-profile/", json={
        "skin_type": skin_type,
        "skin_concerns": ["Acne", "Hyperpigmentation"],
        "allergies": allergies,
        "sensitivities": sensitivities
    }, headers=headers)
    assert prof_res.status_code == 201

    # 4. Lifestyle & telemetry
    client.post("/api/lifestyle/", json={"stress_level": "LOW"}, headers=headers)
    client.post("/api/sleep/", json={"sleep_hours": 8, "sleep_quality": "EXCELLENT"}, headers=headers)
    client.post("/api/hydration/", json={"water_consumed": 2500}, headers=headers)
    client.post("/api/environmental-exposure/", json={"sun_exposure_hours": 1}, headers=headers)

    return email, token, headers


# ====================================================================
# TEST 1: Ingredient Lookup & Catalog
# ====================================================================
def test_m3_test01_ingredient_lookup(client: TestClient):
    res = client.get("/api/ingredients")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 8
    assert any(i["name"].startswith("Niacinamide") for i in data)
    assert any("Salicylic Acid" in i["name"] for i in data)

    # Specific ingredient lookup
    single_res = client.get("/api/ingredients/salicylic acid")
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert "Salicylic Acid" in single_data["name"]
    assert "Beta Hydroxy Acid" in single_data["category"]


# ====================================================================
# TEST 2: Ingredient Suitability Analysis
# ====================================================================
def test_m3_test02_ingredient_suitability(client: TestClient):
    _, _, headers = create_authenticated_user(client, skin_type="OILY")
    res = client.post("/api/ingredients/analyze", json={
        "ingredients_list": ["Salicylic Acid", "Niacinamide", "Hyaluronic Acid"]
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["user_skin_type"] == "OILY"
    assert data["total_analyzed"] == 3
    assert data["suitable_count"] == 3
    assert data["conflict_count"] == 0


# ====================================================================
# TEST 3: Allergy Conflict Detection with High Severity
# ====================================================================
def test_m3_test03_allergy_conflict_detection(client: TestClient):
    _, _, headers = create_authenticated_user(client, allergies="Salicylic Acid")
    res = client.post("/api/ingredients/analyze", json={
        "ingredient_name": "Salicylic Acid"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["conflict_count"] >= 1
    match = next(r for r in data["results"] if "Salicylic" in r["ingredient"])
    assert match["suitable"] is False
    assert match["severity"] == "HIGH"
    assert "documented user allergy" in match["reason"].lower()


# ====================================================================
# TEST 4: Sensitivity Conflict Detection
# ====================================================================
def test_m3_test04_sensitivity_conflict_detection(client: TestClient):
    _, _, headers = create_authenticated_user(client, sensitivities="Retinoids")
    res = client.post("/api/ingredients/analyze", json={
        "ingredient_name": "Retinoids"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    match = next(r for r in data["results"] if "Retin" in r["ingredient"])
    assert match["suitable"] is False
    assert match["severity"] == "MEDIUM"
    assert "skin sensitivity" in match["reason"].lower()


# ====================================================================
# TEST 5: Cross-Ingredient Interaction Check
# ====================================================================
def test_m3_test05_ingredient_interaction_check(client: TestClient):
    # Retinoid + BHA should flag a conflict
    res = client.post("/api/ingredients/interactions", json={
        "ingredients": ["Retinoids", "Salicylic Acid"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["has_conflicts"] is True
    assert data["conflict_count"] >= 1
    assert any(i["interaction_type"] == "CONFLICT" for i in data["interactions"])

    # Niacinamide + Salicylic Acid should be synergistic
    res_syn = client.post("/api/ingredients/interactions", json={
        "ingredients": ["Niacinamide", "Salicylic Acid"]
    })
    assert res_syn.status_code == 200
    data_syn = res_syn.json()
    assert any(i["interaction_type"] == "SYNERGISTIC" for i in data_syn["interactions"])


# ====================================================================
# TEST 6: Ingredient Education Details Response
# ====================================================================
def test_m3_test06_ingredient_education(client: TestClient):
    res = client.get("/api/ingredients/ceramides")
    assert res.status_code == 200
    data = res.json()
    assert "Ceramides" in data["name"]
    assert len(data["primary_benefits"]) > 20
    assert "source_reference" in data
    assert "evidence_level" in data
    assert "precautions" in data


# ====================================================================
# TEST 7: Product Lookup & Catalog Browse
# ====================================================================
def test_m3_test07_product_lookup(client: TestClient):
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) >= 10
    categories = {p["category"] for p in products}
    assert "Face Wash" in categories
    assert "Moisturizer" in categories
    assert "Sunscreen" in categories
    assert "Serum" in categories
    assert "Toner" in categories

    first_id = products[0]["id"]
    _, _, headers = create_authenticated_user(client)
    single_res = client.get(f"/api/products/{first_id}", headers=headers)
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert "suitability_score" in single_data
    assert "product" in single_data


# ====================================================================
# TEST 8: Product Suitability Scoring Engine
# ====================================================================
def test_m3_test08_product_suitability_scoring(client: TestClient):
    # Dry skin user should get high suitability for ceramide cream
    _, _, headers = create_authenticated_user(client, skin_type="DRY")
    res = client.get("/api/products", headers=headers)
    assert res.status_code == 200
    prods = res.json()
    ceramide_cream = next(p for p in prods if "Ceramide Barrier Repair" in p["name"])

    detail_res = client.get(f"/api/products/{ceramide_cream['id']}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["suitability_score"] >= 80
    assert detail["recommended"] is True
    assert any("dry skin" in r.lower() for r in detail["reasons"])


# ====================================================================
# TEST 9: Personalized Product Recommendations
# ====================================================================
def test_m3_test09_personalized_recommendations(client: TestClient):
    _, _, headers = create_authenticated_user(client, skin_type="OILY")
    res = client.post("/api/products/recommend", json={
        "category": "Face Wash"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matches"] >= 1
    assert len(data["recommendations"]) >= 1
    # Top recommended for oily skin should have high suitability
    top = data["recommendations"][0]
    assert top["suitability_score"] >= 70
    assert top["product"]["category"] == "Face Wash"


# ====================================================================
# TEST 10: Multi-Product Side-by-Side Comparison
# ====================================================================
def test_m3_test10_product_comparison(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    prods = client.get("/api/products").json()
    id1, id2 = prods[0]["id"], prods[1]["id"]

    res = client.post("/api/products/compare", json={
        "product_ids": [id1, id2]
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["compared_products"]) == 2
    assert data["best_match_id"] is not None
    assert len(data["summary_verdict"]) > 10


# ====================================================================
# TEST 11: Alternative Product Suggestions on Contraindication
# ====================================================================
def test_m3_test11_alternative_products(client: TestClient):
    # User with Salicylic Acid allergy looking at BHA cleanser
    _, _, headers = create_authenticated_user(client, allergies="Salicylic Acid")
    prods = client.get("/api/products").json()
    bha_cleanse = next(p for p in prods if "Salicylic Acid" in p["name"])

    res = client.get(f"/api/products/{bha_cleanse['id']}/alternatives", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["unsuitable_product"]["id"] == bha_cleanse["id"]
    assert "allergy" in data["unsuitability_reason"].lower() or "conflict" in data["unsuitability_reason"].lower()
    assert len(data["alternatives"]) >= 1
    # Alternatives must not contain the allergen
    for alt in data["alternatives"]:
        assert alt["suitability_score"] >= 70
        assert not any("ALLERGY" in conf for conf in alt["potential_conflicts"])


# ====================================================================
# TEST 12: Budget-Based Recommendations Prioritization
# ====================================================================
def test_m3_test12_budget_filtering(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    # Filter under ₹500
    res = client.post("/api/products/recommend", json={
        "budget_max": 500.0
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["budget_filter_applied"] == 500.0
    for rec in data["recommendations"]:
        assert rec["product"]["price"] <= 500.0


# ====================================================================
# TEST 13: Progress Record Creation & Persistence
# ====================================================================
def test_m3_test13_progress_record_creation(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    res = client.post("/api/progress/snapshot", json={
        "notes": "Week 2 skin progress snapshot",
        "concern_levels": {"Acne": 2, "Dark Spots": 1}
    }, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["total_score"] >= 0
    assert data["skin_condition_score"] >= 0
    assert data["concern_levels"]["Acne"] == 2
    assert "Week 2" in data["notes"]


# ====================================================================
# TEST 14: Historical Progress Retrieval
# ====================================================================
def test_m3_test14_historical_progress_retrieval(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    # Log two snapshots
    client.post("/api/progress/snapshot", json={"notes": "Snapshot 1"}, headers=headers)
    client.post("/api/progress/snapshot", json={"notes": "Snapshot 2"}, headers=headers)

    res = client.get("/api/progress/history", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 2
    assert any("Snapshot 2" in h["notes"] for h in history)


# ====================================================================
# TEST 15: Progress Trend Calculation & Metrics
# ====================================================================
def test_m3_test15_trend_calculation(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    # Log adherence and progress
    client.post("/api/progress/adherence", json={"morning_completed": True, "evening_completed": True}, headers=headers)
    client.post("/api/progress/snapshot", json={"notes": "Assessment 1"}, headers=headers)

    res = client.get("/api/progress/trends", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "overall_change" in data
    assert data["trend"] in ["improving", "stable", "declining"]
    assert len(data["historical_points"]) >= 1
    assert data["recent_adherence_rate"] >= 0.0


# ====================================================================
# TEST 16: Before / After Assessment Comparison
# ====================================================================
def test_m3_test16_before_after_comparison(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    # Log baseline and follow-up snapshots
    client.post("/api/progress/snapshot", json={"notes": "Baseline"}, headers=headers)
    client.post("/api/progress/snapshot", json={"notes": "Followup"}, headers=headers)

    res = client.get("/api/progress/comparison", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "baseline_score" in data
    assert "current_score" in data
    assert data["overall_status"] in ["IMPROVED", "STABLE", "DECLINED"]
    assert len(data["metrics"]) == 5
    assert all("status" in m for m in data["metrics"])


# ====================================================================
# TEST 17: Routine Adherence Logging & Retrieval
# ====================================================================
def test_m3_test17_routine_adherence_tracking(client: TestClient):
    _, _, headers = create_authenticated_user(client)
    # Log adherence for today
    log_res = client.post("/api/progress/adherence", json={
        "morning_completed": True,
        "evening_completed": True,
        "completed_steps": ["Cleanser", "Toner", "Moisturizer", "SPF 50"],
        "missed_steps": [],
        "notes": "Completed full AM and PM steps"
    }, headers=headers)
    assert log_res.status_code == 200
    data = log_res.json()
    assert data["adherence_rate"] == 1.0
    assert data["morning_completed"] is True
    assert data["evening_completed"] is True

    # Retrieve adherence logs
    get_res = client.get("/api/progress/adherence", headers=headers)
    assert get_res.status_code == 200
    adherence_list = get_res.json()
    assert len(adherence_list) >= 1
    assert adherence_list[0]["adherence_rate"] == 1.0


# ====================================================================
# TEST 18: Custom Ingredient Formulation Scanner
# ====================================================================
def test_m3_test18_custom_formula_scanner(client: TestClient):
    _, _, headers = create_authenticated_user(client, allergies="Salicylic Acid")
    custom_formula = "Aqua, Glycerin, Salicylic Acid, Niacinamide, Sodium Hyaluronate"
    res = client.post("/api/ingredients/analyze", json={
        "custom_formula_text": custom_formula
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["conflict_count"] >= 1
    assert any(r["ingredient"].lower().startswith("salicylic") and r["suitable"] is False for r in data["results"])


# ====================================================================
# TEST 19: Authentication & Security Protection on Milestone 3 Routes
# ====================================================================
def test_m3_test19_auth_protection(client: TestClient):
    # Unauthenticated requests to user-specific routes must return 401
    assert client.post("/api/ingredients/analyze", json={}).status_code == 401
    assert client.post("/api/products/recommend", json={}).status_code == 401
    assert client.post("/api/progress/snapshot", json={}).status_code == 401
    assert client.get("/api/progress/history").status_code == 401
    assert client.get("/api/progress/trends").status_code == 401
    assert client.get("/api/progress/comparison").status_code == 401


# ====================================================================
# TEST 20: Regression Test with Full Milestone 1 & 2 Scoring Engine
# ====================================================================
def test_m3_test20_regression_full_integration(client: TestClient):
    _, token, headers = create_authenticated_user(client, skin_type="COMBINATION", allergies="Salicylic Acid")

    # 1. Trigger Milestone 2 assessment & score
    score_res = client.get("/api/skin-intelligence/skin-score", headers=headers)
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert 0 <= score_data["total_score"] <= 100

    # 2. Milestone 3 Recommendations must respect Milestone 2 score & allergy
    recs_res = client.post("/api/products/recommend", json={}, headers=headers)
    assert recs_res.status_code == 200
    recs_data = recs_res.json()
    for rec in recs_data["recommendations"]:
        assert "Salicylic Acid" not in rec["product"]["name"]
        assert not any("ALLERGY" in conf for conf in rec["potential_conflicts"])

    # 3. Create progress record using Milestone 2 scores
    snap_res = client.post("/api/progress/snapshot", json={"notes": "Integrated test snapshot"}, headers=headers)
    assert snap_res.status_code == 201
    snap_data = snap_res.json()
    assert snap_data["total_score"] == score_data["total_score"]
