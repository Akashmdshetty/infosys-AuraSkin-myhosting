import subprocess
import time
import requests
import sys

def verify_live_server():
    print("[1/5] Launching Uvicorn server on port 8000...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    try:
        # Wait up to 10 seconds for server to be responsive
        url = "http://127.0.0.1:8000/health"
        started = False
        for _ in range(20):
            try:
                res = requests.get(url, timeout=1)
                if res.status_code == 200 and res.json() == {"status": "ok"}:
                    started = True
                    break
            except Exception:
                time.sleep(0.5)

        assert started, "Server failed to start on http://127.0.0.1:8000/health"
        print("[2/5] Health Check PASSED: 200 OK ->", res.json())

        # Test CORS preflight over HTTP
        print("[3/5] Testing CORS preflight request...")
        cors_res = requests.options(
            "http://127.0.0.1:8000/api/skin-profile/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            },
            timeout=2
        )
        assert cors_res.status_code == 200
        assert "access-control-allow-origin" in cors_res.headers
        print("[3/5] CORS Verification PASSED ->", dict(cors_res.headers))

        # Test OpenAPI schema
        print("[4/5] Testing OpenAPI documentation...")
        openapi_res = requests.get("http://127.0.0.1:8000/openapi.json", timeout=2)
        assert openapi_res.status_code == 200
        schema = openapi_res.json()
        assert "paths" in schema
        print(f"[4/5] OpenAPI Verification PASSED: {len(schema['paths'])} routes documented")

    finally:
        print("[5/5] Testing Graceful Shutdown...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
            print("[5/5] Graceful Shutdown PASSED: Process terminated cleanly.")
        except subprocess.TimeoutExpired:
            proc.kill()
            print("[5/5] Force killed after timeout.")

if __name__ == "__main__":
    verify_live_server()
