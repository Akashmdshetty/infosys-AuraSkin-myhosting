# AuraSkin AI Skin Intelligence & Personalized Skincare Planner
## Deployment, Operations & Disaster Recovery Guide

---

## 1. Containerized Local & Production Deployment

AuraSkin provides production-ready Docker containers for the Frontend (React + Nginx), Backend (FastAPI + Python 3.11), and PostgreSQL Database.

### 1.1. Quick Start with Docker Compose
```bash
# 1. Clone repository & navigate to project directory
cd project_scaffold

# 2. Configure environment variables
cp .env.example .env

# 3. Build images and start services in background
docker compose up -d --build

# 4. Check running containers and health checks
docker compose ps
```

### 1.2. Accessing Services
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 2. Cloud Deployment Architecture

### 2.1. AWS Architecture (ECS / RDS / CloudFront)
1. **Database**: Provision Amazon RDS for PostgreSQL (Multi-AZ, automated backups).
2. **Backend**: Deploy `backend/Dockerfile` to AWS Elastic Container Service (ECS Fargate) behind an Application Load Balancer (ALB).
3. **Frontend**: Build React bundle `dist/` and host on Amazon S3 + CloudFront CDN with SSL certificate (ACM).
4. **Secrets**: Store `DATABASE_URL`, `JWT_SECRET_KEY`, and SMTP credentials in AWS Secrets Manager.

### 2.2. GCP Architecture (Cloud Run / Cloud SQL)
1. **Database**: Google Cloud SQL for PostgreSQL 16.
2. **Backend**: Build and deploy container to Google Cloud Run with minimum 1 instance for zero-cold-start.
3. **Frontend**: Deploy frontend container to Cloud Run or host static assets on Firebase Hosting / Cloud Storage.
4. **Environment**: Configure environment variables via Google Secret Manager.

---

## 3. Database Migration, Backup & Disaster Recovery

### 3.1. Database Backup Strategy
Run automated daily snapshot backups of the PostgreSQL volume:
```bash
# Daily automated backup script
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker compose exec -T db pg_dump -U auraskin_user -d auraskin_db > "backup_auraskin_${TIMESTAMP}.sql"
```

### 3.2. Database Restoration Procedure
In the event of hardware failure or data recovery:
```bash
# 1. Stop backend services to prevent write locks
docker compose stop backend

# 2. Restore PostgreSQL dump
docker compose exec -T db psql -U auraskin_user -d auraskin_db < "backup_auraskin_20261002.sql"

# 3. Restart backend services
docker compose start backend
```

### 3.3. Non-Destructive Table Migrations
AuraSkin automatically initializes missing database tables using idempotent SQLAlchemy DDL (`Base.metadata.create_all`) without dropping or overwriting existing user data, preserving all clinical logs and longitudinal history.

---

## 4. Production Security Hardening Checklist
- [x] **No hardcoded secrets**: All credentials ingested through environment variables.
- [x] **Non-root container user**: Backend Dockerfile runs under unprivileged `auraskin` system user.
- [x] **CORS restrictions**: Production whitelist restricts API access to authorized frontend domains.
- [x] **JWT Token Encryption**: HS256 algorithm with 60-minute expiration and secure signature validation.
- [x] **Password Hashing**: Bcrypt with salted rounds.
- [x] **Role-Based Access Control**: Strict multi-tenant data isolation preventing unauthorized horizontal data access.
