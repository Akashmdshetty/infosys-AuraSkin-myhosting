import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== STARTING LIVE API INTEGRATION TESTS ===")
    
    with httpx.Client(base_url=BASE_URL, follow_redirects=True) as client:
        # 1. Health Check
        res = client.get("/health")
        print(f"1. Health Check: Status {res.status_code}, Response: {res.json()}")
        assert res.status_code == 200 and res.json() == {"status": "ok"}
        
        # 2. OpenAPI Schema
        res = client.get("/openapi.json")
        print(f"2. OpenAPI Schema: Status {res.status_code}, Title: {res.json().get('info', {}).get('title')}")
        assert res.status_code == 200
        
        # 3. Login Admin
        login_payload = {
            "email": "aakashdshetty@gmail.com",
            "password": "aakashshetty112233"
        }
        res = client.post("/api/auth/login", json=login_payload)
        print(f"3. Login: Status {res.status_code}")
        assert res.status_code == 200, f"Login failed: {res.text}"
        token_data = res.json()
        token = token_data.get("access_token")
        print(f"   Received Access Token successfully (length: {len(token)})")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # 4. Get User Profile (/api/users/me)
        res = client.get("/api/users/me", headers=headers)
        user_data = res.json()
        print(f"4. Get Me: Status {res.status_code}, Email: {user_data.get('email')}, Role: {user_data.get('role')}")
        assert res.status_code == 200
        
        # 5. Admin Users List (/api/admin/users)
        res = client.get("/api/admin/users", headers=headers)
        print(f"5. Admin Users List: Status {res.status_code}, User Count: {len(res.json())}")
        assert res.status_code == 200
        
        # 6. Admin Analytics (/api/admin/analytics)
        res = client.get("/api/admin/analytics", headers=headers)
        print(f"6. Admin Analytics: Status {res.status_code}, Metrics: {res.json()}")
        assert res.status_code == 200

        # 7. Skin Profile Endpoint
        res = client.get("/api/skin-profile/", headers=headers)
        print(f"7. Skin Profile: Status {res.status_code}")
        assert res.status_code in (200, 404) # 404 if profile not yet created for user, 200 if present

    print("\n=== ALL LIVE API TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
