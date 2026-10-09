import io
import uuid
import pytest
from fastapi.testclient import TestClient
import openpyxl

from app.core.config import settings

# Test User Credentials
RUN_ID = uuid.uuid4().hex[:6]
USER_EMAIL = f"m4_user_{RUN_ID}@example.com"
USER_PWD = "Password123!"
OTHER_USER_EMAIL = f"m4_other_{RUN_ID}@example.com"
PROFESSIONAL_EMAIL = f"m4_prof_{RUN_ID}@example.com"
ADMIN_EMAIL = settings.ADMIN_EMAIL
ADMIN_PASSWORD = settings.ADMIN_PASSWORD

STATE = {}

def get_auth_headers(client: TestClient, email: str, password: str, name: str = "Test User", role: str = "USER") -> dict:
    client.post("/api/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "age": 28,
        "country": "United States"
    })
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_m4_01_operational_health_checks(client: TestClient):
    """Test standard /health and comprehensive /api/health endpoints."""
    # 1. Standard health
    res1 = client.get("/health")
    assert res1.status_code == 200
    assert res1.json() == {"status": "ok"}

    # 2. Operational /api/health
    res2 = client.get("/api/health")
    assert res2.status_code == 200
    data = res2.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "4.0.0"
    assert "services" in data


def test_m4_02_notification_preferences(client: TestClient):
    """Test getting and updating notification preferences."""
    headers = get_auth_headers(client, USER_EMAIL, USER_PWD, "M4 User")
    STATE["user_headers"] = headers

    # 1. Get default preferences
    get_res = client.get("/api/notifications/preferences", headers=headers)
    assert get_res.status_code == 200
    prefs = get_res.json()
    assert prefs["in_app_enabled"] is True
    assert prefs["am_routine_reminder"] is True

    # 2. Update preferences
    update_res = client.put("/api/notifications/preferences", json={
        "email_enabled": True,
        "hydration_reminder": True,
        "quiet_hours_enabled": True,
        "quiet_hours_start": "23:00",
        "quiet_hours_end": "06:00"
    }, headers=headers)
    assert update_res.status_code == 200
    updated_prefs = update_res.json()
    assert updated_prefs["quiet_hours_enabled"] is True
    assert updated_prefs["quiet_hours_start"] == "23:00"


def test_m4_03_notification_smart_reminders_and_retrieval(client: TestClient):
    """Test triggering automated smart reminders and retrieving notifications."""
    headers = STATE["user_headers"]

    # Trigger smart reminders
    trigger_res = client.post("/api/notifications/check-reminders", headers=headers)
    assert trigger_res.status_code == 200
    notifs = trigger_res.json()
    assert isinstance(notifs, list)

    # Check unread count
    count_res = client.get("/api/notifications/unread-count", headers=headers)
    assert count_res.status_code == 200
    assert "unread_count" in count_res.json()

    # List notifications
    list_res = client.get("/api/notifications?limit=20", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert "notifications" in list_data
    assert "total" in list_data
    assert "unread_count" in list_data


def test_m4_04_notification_read_and_batch_actions(client: TestClient):
    """Test marking individual notification as read and batch mark-all-read."""
    headers = STATE["user_headers"]

    # Get notifications
    list_res = client.get("/api/notifications", headers=headers)
    items = list_res.json()["notifications"]

    if items:
        target_id = items[0]["id"]
        # Mark single as read
        patch_res = client.patch(f"/api/notifications/{target_id}/read", headers=headers)
        assert patch_res.status_code == 200
        assert patch_res.json()["is_read"] is True

    # Mark all as read
    mark_all_res = client.post("/api/notifications/mark-all-read", headers=headers)
    assert mark_all_res.status_code == 200

    # Unread count should now be 0
    count_res = client.get("/api/notifications/unread-count", headers=headers)
    assert count_res.json()["unread_count"] == 0


def test_m4_05_comprehensive_reports_generation(client: TestClient):
    """Test generating comprehensive 18-part report and subreports."""
    headers = STATE["user_headers"]

    # Setup user profile and assessment
    client.post("/api/skin-profile/", json={
        "skin_type": "COMBINATION",
        "skin_concerns": "Acne, Hyperpigmentation",
        "allergies": "Fragrance",
        "sensitivities": "High Salicylic Acid"
    }, headers=headers)

    client.post("/api/skin-intelligence/skin-assessment", headers=headers)

    # 1. Comprehensive Report
    comp_res = client.get("/api/reports/comprehensive", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "overall_skin_health_score" in comp_data
    assert "score_breakdown" in comp_data
    assert "morning_routine" in comp_data
    assert "evening_routine" in comp_data
    assert "safety_notes" in comp_data

    # 2. Subreports
    assess_res = client.get("/api/reports/assessment", headers=headers)
    assert assess_res.status_code == 200
    assert assess_res.json()["report_type"] == "SKIN_ASSESSMENT"

    score_res = client.get("/api/reports/aurascore", headers=headers)
    assert score_res.status_code == 200
    assert score_res.json()["report_type"] == "AURASCORE_5_FACTOR"

    routine_res = client.get("/api/reports/routine", headers=headers)
    assert routine_res.status_code == 200
    assert routine_res.json()["report_type"] == "PERSONALIZED_ROUTINE"

    safety_res = client.get("/api/reports/safety", headers=headers)
    assert safety_res.status_code == 200
    assert safety_res.json()["report_type"] == "INGREDIENT_SAFETY"

    prog_res = client.get("/api/reports/progress", headers=headers)
    assert prog_res.status_code == 200
    assert prog_res.json()["report_type"] == "PROGRESS_LONGITUDINAL"

    ba_res = client.get("/api/reports/before-after", headers=headers)
    assert ba_res.status_code == 200
    assert ba_res.json()["report_type"] == "BEFORE_AFTER_COMPARISON"


def test_m4_06_pdf_report_export(client: TestClient):
    """Test binary PDF export with ReportLab formatting."""
    headers = STATE["user_headers"]

    res = client.get("/api/reports/export/pdf", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment;" in res.headers.get("content-disposition", "")

    # Validate PDF signature
    content = res.content
    assert content.startswith(b"%PDF"), "Exported file does not contain valid PDF header!"
    assert len(content) > 1000, "PDF export file size is suspiciously small"


def test_m4_07_excel_report_export(client: TestClient):
    """Test multi-sheet Excel export with Openpyxl."""
    headers = STATE["user_headers"]

    res = client.get("/api/reports/export/excel", headers=headers)
    assert res.status_code == 200
    assert "openxmlformats" in res.headers["content-type"]
    assert "attachment;" in res.headers.get("content-disposition", "")

    content = res.content
    assert len(content) > 1000, "Excel export file size is suspiciously small"

    # Load workbook and verify sheets
    wb = openpyxl.load_workbook(io.BytesIO(content))
    expected_sheets = ["AuraSkin Summary", "5-Factor Breakdown", "Skincare Regimen", "Adherence Logs", "Progress Snapshots"]
    for s in expected_sheets:
        assert s in wb.sheetnames, f"Expected sheet {s} missing in exported Excel workbook"


def test_m4_08_rbac_data_isolation_and_professional_access(client: TestClient):
    """Test RBAC security and client data isolation."""
    user_headers = STATE["user_headers"]

    # 1. Create a second regular user
    other_headers = get_auth_headers(client, OTHER_USER_EMAIL, USER_PWD, "Other User")

    # Regular user cannot access other user's client report via client_id param
    forbidden_res = client.get("/api/reports/comprehensive?client_id=1", headers=other_headers)
    # If other user is not professional/admin, requesting client_id of someone else must be rejected
    assert forbidden_res.status_code == 403

    # 2. Register a Professional (Consultant)
    prof_headers = get_auth_headers(client, PROFESSIONAL_EMAIL, USER_PWD, "Dr. Derm", role="DERMATOLOGIST")
    # Verified by Admin
    # First login as admin to verify professional
    admin_login = client.post("/api/auth/login", json={"email": settings.ADMIN_EMAIL, "password": settings.ADMIN_PASSWORD})
    if admin_login.status_code == 200:
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        users_list = client.get("/api/admin/users", headers=admin_headers).json()
        prof_user = next((u for u in users_list if u["email"] == PROFESSIONAL_EMAIL), None)
        if prof_user and prof_user.get("verification_status") != "VERIFIED":
            client.post(f"/api/admin/verify-professional/{prof_user['id']}", json={"status": "VERIFIED"}, headers=admin_headers)

        # Verified professional can view clients list
        clients_res = client.get("/api/professional/clients", headers=prof_headers)
        if clients_res.status_code == 200:
            assert isinstance(clients_res.json(), list)

        # Admin analytics
        analytics_res = client.get("/api/admin/analytics", headers=admin_headers)
        assert analytics_res.status_code == 200
        an_data = analytics_res.json()
        assert "total_users" in an_data
        assert "system_status" in an_data


def test_m4_09_full_end_to_end_pipeline(client: TestClient):
    """
    Test complete End-to-End linked pipeline:
    Register -> Profile -> Assessment -> AuraScore -> Routine -> Product -> Ingredient Scan
    -> Add to Routine -> Adherence -> Progress -> Notifications -> PDF/Excel Export
    """
    e2e_id = uuid.uuid4().hex[:6]
    e2e_email = f"e2e_{e2e_id}@example.com"
    headers = get_auth_headers(client, e2e_email, USER_PWD, "E2E Champion")

    # 1. Profile
    p_res = client.post("/api/skin-profile/", json={
        "skin_type": "DRY",
        "skin_concerns": "Dehydration, Dullness",
        "allergies": "None",
        "sensitivities": "Fragrance"
    }, headers=headers)
    assert p_res.status_code == 201

    # 2. Telemetry
    client.post("/api/hydration/", json={"water_ml": 2200}, headers=headers)
    client.post("/api/sleep/", json={"sleep_hours": 8.0, "sleep_quality": "EXCELLENT"}, headers=headers)

    # 3. Assessment
    a_res = client.post("/api/skin-intelligence/skin-assessment", headers=headers)
    assert a_res.status_code == 201

    # 4. AuraScore
    s_res = client.get("/api/skin-intelligence/skin-score", headers=headers)
    assert s_res.status_code == 200
    assert 0 <= s_res.json()["total_score"] <= 100

    # 5. Routine
    r_res = client.get("/api/skin-intelligence/routine/current", headers=headers)
    assert r_res.status_code == 200

    # 6. Product lookup & Suitability
    prods_res = client.post("/api/products/recommend", json={"category": "Moisturizer"}, headers=headers)
    assert prods_res.status_code == 200
    assert prods_res.json()["total_matches"] >= 1

    # 7. INCI Scanner
    scan_res = client.post("/api/ingredients/analyze", json={
        "custom_formula_text": "Water, Glycerin, Hyaluronic Acid, Niacinamide, Ceramides"
    }, headers=headers)
    assert scan_res.status_code == 200
    assert "results" in scan_res.json()

    # 8. Adherence
    adh_res = client.post("/api/progress/adherence", json={
        "date": "2026-10-02",
        "morning_completed": True,
        "evening_completed": True,
        "adherence_rate": 1.0,
        "notes": "Full regimen completed."
    }, headers=headers)
    assert adh_res.status_code in [200, 201]

    # 9. Progress Snapshot
    prog_res = client.post("/api/progress/snapshot", json={
        "notes": "Skin barrier feeling significantly hydrated and calm."
    }, headers=headers)
    assert prog_res.status_code == 201

    # 10. Trigger Notifications
    notif_res = client.post("/api/notifications/check-reminders", headers=headers)
    assert notif_res.status_code == 200

    # 11. PDF & Excel Export
    pdf_res = client.get("/api/reports/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b"%PDF")

    xlsx_res = client.get("/api/reports/export/excel", headers=headers)
    assert xlsx_res.status_code == 200
    assert len(xlsx_res.content) > 1000
