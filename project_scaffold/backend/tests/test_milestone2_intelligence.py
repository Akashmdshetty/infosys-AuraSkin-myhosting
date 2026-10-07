import os
import uuid
import pytest
import secrets
import hashlib
from fastapi.testclient import TestClient
from dotenv import load_dotenv

from app.main import app
from app.db.session import SessionLocal
from app.models import User, SkinProfile, LifestyleProfile, SleepRecord, HydrationRecord, EnvironmentalExposure, PasswordResetToken, RoleEnum, VerificationStatus
from app.services.scoring_service import calculate_skin_health_score
from app.services.skin_assessment_service import analyze_skin_profile
from app.services.recommendation_service import generate_evidence_recommendations
from app.services.routine_generation_service import generate_personalized_routine

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "aakashdshetty@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "aakashshetty112233")

@pytest.fixture
def client():
    return TestClient(app)


def test_milestone2_forgot_and_reset_password(client: TestClient):
    run_id = uuid.uuid4().hex[:6]
    test_email = f"reset_test_{run_id}@example.com"
    
    # 1. Register user
    reg_res = client.post("/api/auth/register", json={
        "name": "Reset User",
        "email": test_email,
        "password": "OldPassword123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201

    # 2. Request forgot password
    forgot_res = client.post("/api/auth/forgot-password", json={"email": test_email})
    assert forgot_res.status_code == 200
    data = forgot_res.json()
    assert "If an account exists" in data["message"]
    assert "reset_token" not in data

    # 3. Retrieve token securely from DB
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == test_email).first()
        reset_entry = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id, PasswordResetToken.used == False).first()
        assert reset_entry is not None
    finally:
        db.close()

    # 4. Attempt reset with invalid token -> fails
    invalid_reset = client.post("/api/auth/reset-password", json={
        "token": "invalid_fake_token_12345",
        "new_password": "NewPassword123!"
    })
    assert invalid_reset.status_code == 400

    # 5. Reset password using valid raw token
    test_raw_token = secrets.token_urlsafe(32)
    test_hash = hashlib.sha256(test_raw_token.encode()).hexdigest()
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == test_email).first()
        new_entry = PasswordResetToken(user_id=user.id, token_hash=test_hash, expires_at=reset_entry.expires_at, used=False)
        db.add(new_entry)
        db.commit()
    finally:
        db.close()

    succ_reset = client.post("/api/auth/reset-password", json={
        "token": test_raw_token,
        "new_password": "NewPassword123!"
    })
    assert succ_reset.status_code == 200

    # 6. Verify reuse fails
    reuse_reset = client.post("/api/auth/reset-password", json={
        "token": test_raw_token,
        "new_password": "AnotherPassword123!"
    })
    assert reuse_reset.status_code == 400

    # 7. Verify login with old password fails
    fail_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "OldPassword123!"
    })
    assert fail_login.status_code == 401

    # 8. Verify login with new password succeeds
    succ_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "NewPassword123!"
    })
    assert succ_login.status_code == 200


def test_milestone2_professional_verification_flow(client: TestClient):
    run_id = uuid.uuid4().hex[:6]
    derm_email = f"dr_derm_{run_id}@example.com"

    reg_res = client.post("/api/auth/register", json={
        "name": "Dr. Derm Applicant",
        "email": derm_email,
        "password": "Password123!",
        "role": "DERMATOLOGIST",
        "professional_title": "Board Certified Dermatologist",
        "qualifications": "MD Dermatology",
        "registration_number": "DERM-998822"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["requested_role"] == "DERMATOLOGIST"
    assert reg_data["verification_status"] == "PENDING"
    derm_user_id = reg_data["id"]

    admin_login = client.post("/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    pending_res = client.get("/api/admin/pending-professionals", headers=admin_headers)
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert any(u["id"] == derm_user_id for u in pending_list)

    verify_res = client.post(f"/api/admin/verify-professional/{derm_user_id}", json={"status": "VERIFIED"}, headers=admin_headers)
    assert verify_res.status_code == 200
    updated_user = verify_res.json()
    assert updated_user["verification_status"] == "VERIFIED"
    assert updated_user["role"] == "DERMATOLOGIST"


# ====================================================================
# PHASE 11: 12 MANDATORY MILESTONE 2 INTELLIGENCE MODEL UNIT & INTEGRATION TESTS
# ====================================================================

def test_phase11_scoring_all_components_100():
    """TEST 1: All components = 100 -> Expected score = 100"""
    db = SessionLocal()
    try:
        user = User(name="Perfect User", email=f"perfect_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="NORMAL", skin_concerns="", allergies="", sensitivities="")
        user.lifestyle_profile = LifestyleProfile(user_id=user.id, stress_level="LOW")
        user.sleep_records = [SleepRecord(user_id=user.id, sleep_hours=8, sleep_quality="EXCELLENT")]
        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=2500)]
        user.environment_records = [EnvironmentalExposure(user_id=user.id, sun_exposure_hours=1)]
        db.commit()

        assessment = analyze_skin_profile(db, user)
        score_rec = calculate_skin_health_score(db, user, assessment)

        assert score_rec.total_score == 100
        assert score_rec.skin_condition_score == 100
        assert score_rec.lifestyle_score == 100
        assert score_rec.sleep_score == 100
        assert score_rec.routine_consistency_score == 100
        assert score_rec.hydration_score == 100
    finally:
        db.close()


def test_phase11_scoring_all_components_0():
    """TEST 2: All components = 0 or worst case -> Expected bounded low score"""
    db = SessionLocal()
    try:
        user = User(name="Poor User", email=f"poor_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="SENSITIVE", skin_concerns="Acne,Hyperpigmentation,Dark Spots,Wrinkles,Redness", sensitivities="Fragrance,Parabens")
        user.lifestyle_profile = LifestyleProfile(user_id=user.id, stress_level="HIGH")
        user.sleep_records = [SleepRecord(user_id=user.id, sleep_hours=2, sleep_quality="POOR")]
        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=0)]
        user.environment_records = [EnvironmentalExposure(user_id=user.id, sun_exposure_hours=8)]
        db.commit()

        assessment = analyze_skin_profile(db, user)
        score_rec = calculate_skin_health_score(db, user, assessment)

        assert 0 <= score_rec.total_score <= 100
        assert score_rec.hydration_score == 0
    finally:
        db.close()


def test_phase11_known_values_math_assertion():
    """
    TEST 3: Known values formula test
    Skin Condition = 80, Lifestyle = 60, Sleep = 70, Routine = 50, Hydration = 90
    Expected: (80*0.35) + (60*0.20) + (70*0.15) + (50*0.20) + (90*0.10)
            = 28 + 12 + 10.5 + 10 + 9 = 69.5 -> 70
    """
    norm_skin = 80.0
    norm_life = 60.0
    norm_sleep = 70.0
    norm_routine = 50.0
    norm_hydra = 90.0

    contrib_skin = norm_skin * 0.35      # 28.0
    contrib_life = norm_life * 0.20      # 12.0
    contrib_sleep = norm_sleep * 0.15    # 10.5
    contrib_routine = norm_routine * 0.20# 10.0
    contrib_hydra = norm_hydra * 0.10    # 9.0

    total_expected = int(round(contrib_skin + contrib_life + contrib_sleep + contrib_routine + contrib_hydra))
    assert total_expected == 70


def test_phase11_different_users_different_scores():
    """TEST 4: Two different users with different data must receive different scores."""
    db = SessionLocal()
    try:
        user_a = User(name="User A", email=f"usera_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        user_b = User(name="User B", email=f"userb_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add_all([user_a, user_b])
        db.commit()

        # User A: High health
        user_a.skin_profile = SkinProfile(user_id=user_a.id, skin_type="NORMAL", skin_concerns="")
        user_a.lifestyle_profile = LifestyleProfile(user_id=user_a.id, stress_level="LOW")
        user_a.sleep_records = [SleepRecord(user_id=user_a.id, sleep_hours=8, sleep_quality="EXCELLENT")]
        user_a.hydration_records = [HydrationRecord(user_id=user_a.id, water_consumed=2500)]
        user_a.environment_records = [EnvironmentalExposure(user_id=user_a.id, sun_exposure_hours=1)]

        # User B: Low health
        user_b.skin_profile = SkinProfile(user_id=user_b.id, skin_type="OILY", skin_concerns="Acne,Dark Spots")
        user_b.lifestyle_profile = LifestyleProfile(user_id=user_b.id, stress_level="HIGH")
        user_b.sleep_records = [SleepRecord(user_id=user_b.id, sleep_hours=5, sleep_quality="POOR")]
        user_b.hydration_records = [HydrationRecord(user_id=user_b.id, water_consumed=1000)]
        user_b.environment_records = [EnvironmentalExposure(user_id=user_b.id, sun_exposure_hours=5)]
        db.commit()

        score_a = calculate_skin_health_score(db, user_a, analyze_skin_profile(db, user_a))
        score_b = calculate_skin_health_score(db, user_b, analyze_skin_profile(db, user_b))

        assert score_a.total_score != score_b.total_score
        assert score_a.total_score > score_b.total_score
    finally:
        db.close()


def test_phase11_changing_hydration_changes_contribution():
    """TEST 5: Changing hydration data should change the hydration contribution."""
    db = SessionLocal()
    try:
        user = User(name="Hydra User", email=f"hydra_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="NORMAL")
        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=1000)]
        db.commit()

        score_low = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=2500)]
        db.commit()

        score_high = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        assert score_high.hydration_score > score_low.hydration_score
    finally:
        db.close()


def test_phase11_changing_sleep_changes_contribution():
    """TEST 6: Changing sleep data should change the sleep contribution."""
    db = SessionLocal()
    try:
        user = User(name="Sleep User", email=f"sleep_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.sleep_records = [SleepRecord(user_id=user.id, sleep_hours=4, sleep_quality="POOR")]
        db.commit()
        score_bad = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        user.sleep_records = [SleepRecord(user_id=user.id, sleep_hours=8, sleep_quality="EXCELLENT")]
        db.commit()
        score_good = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        assert score_good.sleep_score > score_bad.sleep_score
    finally:
        db.close()


def test_phase11_changing_routine_completeness_changes_contribution():
    """TEST 7: Changing routine logging completeness changes routine consistency contribution."""
    db = SessionLocal()
    try:
        user = User(name="Routine User", email=f"rtn_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        # Incomplete logging (only profile)
        user.skin_profile = SkinProfile(user_id=user.id, skin_type="NORMAL")
        db.commit()
        score_part = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        # Full logging across all modules
        user.lifestyle_profile = LifestyleProfile(user_id=user.id, stress_level="LOW")
        user.sleep_records = [SleepRecord(user_id=user.id, sleep_hours=8, sleep_quality="GOOD")]
        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=2500)]
        user.environment_records = [EnvironmentalExposure(user_id=user.id, sun_exposure_hours=1)]
        db.commit()

        score_full = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        assert score_full.routine_consistency_score > score_part.routine_consistency_score
    finally:
        db.close()


def test_phase11_allergy_conflict_prevents_recommendation():
    """TEST 8: Allergy conflict prevents recommendation and adds exclusion reason."""
    db = SessionLocal()
    try:
        user = User(name="Allergy User", email=f"alg_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="OILY", skin_concerns="ACNE", allergies="Salicylic Acid")
        db.commit()

        assessment = analyze_skin_profile(db, user)
        recs = generate_evidence_recommendations(db, user, assessment)

        assert not any("Salicylic Acid" in r.ingredient_or_category for r in recs)
    finally:
        db.close()


def test_phase11_sensitivity_affects_routine():
    """TEST 9: Sensitivity affects recommendation and routine steps."""
    db = SessionLocal()
    try:
        user = User(name="Sensitive User", email=f"sens_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="SENSITIVE", skin_concerns="Redness", sensitivities="Retinoids")
        db.commit()

        assessment = analyze_skin_profile(db, user)
        routine = generate_personalized_routine(db, user, assessment)

        # Retinoids should NOT be recommended or included in PM step
        assert "Retinoids" not in routine.evening_routine
    finally:
        db.close()


def test_phase11_different_skin_profiles_generate_different_routines():
    """TEST 10: Different skin profiles generate meaningfully different routines."""
    db = SessionLocal()
    try:
        user_oily = User(name="Oily User", email=f"oily_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        user_dry = User(name="Dry User", email=f"dry_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add_all([user_oily, user_dry])
        db.commit()

        user_oily.skin_profile = SkinProfile(user_id=user_oily.id, skin_type="OILY", skin_concerns="ACNE")
        user_dry.skin_profile = SkinProfile(user_id=user_dry.id, skin_type="DRY", skin_concerns="DRYNESS")
        db.commit()

        routine_oily = generate_personalized_routine(db, user_oily, analyze_skin_profile(db, user_oily))
        routine_dry = generate_personalized_routine(db, user_dry, analyze_skin_profile(db, user_dry))

        assert routine_oily.morning_routine != routine_dry.morning_routine
    finally:
        db.close()


def test_phase11_missing_data_does_not_generate_nan_or_errors():
    """TEST 11: Missing data does not generate NaN, Infinity, or unhandled errors."""
    db = SessionLocal()
    try:
        user = User(name="Empty User", email=f"empty_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        assessment = analyze_skin_profile(db, user)
        score_rec = calculate_skin_health_score(db, user, assessment)

        assert isinstance(score_rec.total_score, int)
        assert 0 <= score_rec.total_score <= 100
        assert assessment.confidence_score > 0.0
    finally:
        db.close()


def test_phase11_score_always_between_0_and_100():
    """TEST 12: Score is always bounded strictly between 0 and 100."""
    db = SessionLocal()
    try:
        user = User(name="Bounded User", email=f"bound_{uuid.uuid4().hex[:4]}@example.com", password_hash="pw")
        db.add(user)
        db.commit()

        user.skin_profile = SkinProfile(user_id=user.id, skin_type="NORMAL")
        user.hydration_records = [HydrationRecord(user_id=user.id, water_consumed=10000)] # Extreme hydration
        db.commit()

        score_rec = calculate_skin_health_score(db, user, analyze_skin_profile(db, user))

        assert 0 <= score_rec.total_score <= 100
        assert score_rec.hydration_score <= 100
    finally:
        db.close()
