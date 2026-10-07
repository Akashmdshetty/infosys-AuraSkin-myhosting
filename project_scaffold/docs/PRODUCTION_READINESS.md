# AuraSkin Production Readiness & Cloud Deployment Specification

================================================================================
EXECUTIVE SUMMARY
================================================================================
AuraSkin is an enterprise-grade AI Skin Intelligence & Personalized Skincare Planner.
This document outlines the complete production-hardening architecture, database migration protocols, performance configurations, container security standards, and step-by-step readiness for future deployments to AWS or Azure.

---

## 1. System Architecture & Component Diagram

```
                             INTERNET
                                |
                                v
               +----------------------------------+
               |      Frontend / Nginx (Port 80)  |
               |   (React 18 + Vite Production)   |
               +----------------------------------+
                     |                      |
            /api /health              Static Assets
                     |                 (Gzip & Cache)
                     v
       +------------------------------------+
       |  FastAPI Backend (Port 8000)       |
       |  Gunicorn + Uvicorn Workers        |
       |  - Request ID Correlation          |
       |  - Security Headers (nosniff, etc) |
       |  - Connection Pooling              |
       |  - Liveness / Readiness Probes     |
       +------------------------------------+
                     |
            Internal SQLAlchemy
            Pool (Port 5432)
                     v
       +------------------------------------+
       |  PostgreSQL 16 Database            |
       |  - Named Volume Persistence        |
       |  - Internal Network Isolation      |
       |  - Indexed Foreign Keys & Dates    |
       +------------------------------------+
```

---

## 2. Production Optimizations

### 2.1. Backend Server Optimization
- **Production ASGI Server**: Gunicorn multi-process manager with `UvicornWorker` (`uvicorn.workers.UvicornWorker`).
- **Configurable Concurrency**: Controlled via `WEB_CONCURRENCY` environment variable (defaults to `2` workers for container efficiency).
- **Graceful Timeouts**: Configurable request timeouts via `WEB_TIMEOUT=120` and keep-alive recycling.

### 2.2. Database Connection Pooling & Performance
- **Connection Pooling Parameters**:
  - `DATABASE_POOL_SIZE=10`
  - `DATABASE_MAX_OVERFLOW=10`
  - `DATABASE_POOL_TIMEOUT=30`
  - `DATABASE_POOL_RECYCLE=1800` (recycles connections every 30 minutes to prevent stale sockets)
  - `DATABASE_POOL_PRE_PING=True` (verifies connection liveness before execution)
- **Automatic Transaction Rollback**: In `get_db()`, failed requests trigger `db.rollback()` before closing the session to prevent orphaned transactions.
- **Index Optimization**: Explicit database indexes added across foreign keys, user lookups, dates, and status columns:
  - `users.email` (unique index)
  - `skin_assessments.user_id`, `skin_assessments.created_at`
  - `skin_health_scores.user_id`, `skin_health_scores.assessment_id`, `skin_health_scores.created_at`
  - `skincare_routines.user_id`, `skincare_routines.assessment_id`, `skincare_routines.created_at`
  - `recommendations.user_id`, `recommendations.assessment_id`, `recommendations.created_at`
  - `products.name`, `products.brand`, `products.category`
  - `product_recommendations.user_id`, `product_recommendations.product_id`, `product_recommendations.created_at`
  - `progress_records.user_id`, `progress_records.recorded_at`
  - `routine_adherence_records.user_id`, `routine_adherence_records.date`
  - `notifications.user_id`, `notifications.is_read`, `notifications.notification_type`, `notifications.created_at`
  - `consultation_requests.client_id`, `consultation_requests.professional_id`, `consultation_requests.status`, `consultation_requests.created_at`

### 2.3. Database Migrations (Alembic)
- **Alembic Engine**: Initialized with `alembic.ini`, `alembic/env.py`, and `alembic/versions/0001_initial_production_schema.py`.
- **Production Migration Command**:
  ```bash
  alembic upgrade head
  ```

### 2.4. Frontend Bundle & Performance Optimization
- **Route Code Splitting**: Implemented `React.lazy()` and `Suspense` for large sub-pages (`ProductsPage`, `IngredientsPage`, `ProgressPage`, `ReportsPage`, `PortalsPage`, `ProfilePage`).
- **Vendor Chunk Splitting**: Rollup configured with `manualChunks` separating `vendor-react` (`react`, `react-dom`) and `vendor-icons` (`lucide-react`).
- **Bundle Metrics**:
  - Main bundle size reduced from `525 kB` to `128 kB` (gzipped: `31.7 kB`).
  - Production build generates 0 TypeScript errors and 0 chunk size warnings.

---

## 3. Security Hardening

- **Zero Hardcoded Secrets**: Managed via `.env` with comprehensive `.env.example`.
- **Role-Based Access Control (RBAC)**: Strict role barriers (`USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`).
- **Tenant Data Isolation**: Normal users cannot read or mutate other users' skin scores, profiles, routines, or reports.
- **Production Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Cache-Control: no-store, no-cache, must-revalidate` on sensitive authentication and user endpoints.
- **CORS Hardening**: Strict origin whitelist configured via `ALLOWED_ORIGINS` in `config.py`.
- **Non-Root Container User**: Backend container runs under dedicated unprivileged system user `auraskin` (`uid: 1001`).
- **PostgreSQL Isolation**: PostgreSQL port 5432 is internal to the Docker network (`auraskin-net`) and not exposed to the public host.

---

## 4. Observability, Logging & Health Probes

### 4.1. Request Correlation IDs
- Every API request is assigned a unique `X-Request-ID` (or adopts incoming `X-Request-ID` header from load balancer).
- Request ID is passed to logs and returned in response headers for distributed tracing.

### 4.2. Health Check Endpoints
| Endpoint | Purpose | Dependency | Expected Response |
| :--- | :--- | :--- | :--- |
| `GET /health` | Simple legacy probe | None | `{"status": "ok"}` |
| `GET /health/live` | Container Liveness probe | Application process | `{"status": "alive", "timestamp": "..."}` |
| `GET /health/ready` | Container Readiness probe | PostgreSQL DB (`SELECT 1`) | `{"status": "ready", "database": "connected"}` |
| `GET /api/health` | Deep Observability probe | All subsystems | Subsystem operational status breakdown |

---

## 5. Local Production Execution

```bash
# 1. Navigate to project directory
cd project_scaffold

# 2. Configure environment
cp .env.example .env

# 3. Start production containers
docker compose up -d --build

# 4. Verify running health checks
docker compose ps

# 5. Run database migrations
docker compose exec backend alembic upgrade head
```

---

## 6. Cloud Deployment Readiness (Cloud-Neutral)

AuraSkin is designed to be **100% cloud-neutral**. No AWS-specific or Azure-specific SDKs are hardcoded into the application core.

### 6.1. Target Option A — Amazon Web Services (AWS)

```
                            Route 53 DNS / ACM SSL
                                      |
                                      v
                        Application Load Balancer (ALB)
                                      |
                     +----------------+----------------+
                     |                                 |
                     v                                 v
        AWS ECS / Fargate (Frontend)      AWS ECS / Fargate (Backend)
         (Nginx Static + Reverse Proxy)    (FastAPI + Gunicorn Workers)
                     |                                 |
                     +----------------+----------------+
                                      |
                                      v
                          Amazon RDS for PostgreSQL
                          (Multi-AZ, Encrypted KMS)
```

1. **Database**: Amazon RDS for PostgreSQL 16 (Multi-AZ with automated point-in-time snapshots).
2. **Container Registry**: Amazon Elastic Container Registry (ECR).
3. **Backend Service**: AWS ECS Fargate task running `backend:latest` image with environment variables loaded from AWS Secrets Manager / Parameter Store.
4. **Frontend Service**: AWS ECS Fargate task running `frontend:latest` (or S3 + CloudFront distribution).
5. **Ingress**: AWS Application Load Balancer (ALB) with ACM HTTPS certificate forwarding `/api/*` to Backend target group and `/*` to Frontend target group.

### 6.2. Target Option B — Microsoft Azure

```
                           Azure Front Door / CDN
                                      |
                                      v
                        Azure Container Apps Ingress
                                      |
                     +----------------+----------------+
                     |                                 |
                     v                                 v
         Azure Container App (Frontend)    Azure Container App (Backend)
         (Nginx Static Container)          (FastAPI Gunicorn Container)
                                                       |
                                                       v
                                     Azure Database for PostgreSQL
                                     (Flexible Server, Zone-Redundant)
```

1. **Database**: Azure Database for PostgreSQL Flexible Server (Zone-redundant with automated geo-backups).
2. **Container Registry**: Azure Container Registry (ACR).
3. **Backend Service**: Azure Container Apps (ACA) with Dapr / HTTP scale rules and environment secrets mapped from Azure Key Vault.
4. **Frontend Service**: Azure Container Apps (or Azure Static Web Apps).
5. **Ingress**: Azure Front Door or ACA Managed Ingress with managed TLS certificates.

---

## 7. Disaster Recovery & Backup Protocol

### 7.1. Database Backup Command
```bash
# Export compressed PostgreSQL snapshot
docker compose exec -T db pg_dump -U auraskin_user -d auraskin_db > "auraskin_backup_$(date +%Y%m%d_%H%M%S).sql"
```

### 7.2. Database Restoration Command
```bash
# Restore PostgreSQL snapshot
docker compose exec -T db psql -U auraskin_user -d auraskin_db < "auraskin_backup_file.sql"
```
