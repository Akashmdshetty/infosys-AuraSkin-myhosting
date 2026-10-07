import os
import multiprocessing

# Gunicorn production configuration for AuraSkin API
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
worker_class = "uvicorn.workers.UvicornWorker"
timeout = int(os.getenv("WEB_TIMEOUT", "120"))
keepalive = int(os.getenv("WEB_KEEPALIVE", "5"))

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info").lower()

# Security & Worker Lifecycle
worker_tmp_dir = "/dev/shm" if os.path.exists("/dev/shm") else None
max_requests = 1000
max_requests_jitter = 50
