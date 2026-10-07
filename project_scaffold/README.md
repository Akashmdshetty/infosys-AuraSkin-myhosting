# AuraSkin — AI Skin Intelligence & Personalized Skincare Planner
### Final Production Release & Cloud-Ready Deployment

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-83%2F83%20Passing-10b981.svg)](https://pytest.org)
[![Frontend Build](https://img.shields.io/badge/Frontend%20Build-Clean%20(0%20Errors)-0d9488.svg)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Production%20Ready-2496ed.svg)](https://docker.com)
[![Cloud Ready](https://img.shields.io/badge/Cloud-AWS%20%7C%20Azure%20Ready-ff9900.svg)](docs/PRODUCTION_READINESS.md)

---

## 🌟 Executive Overview
**AuraSkin** is an enterprise-grade AI Skin Intelligence & Personalized Skincare Planning system. It calculates an explainable **5-Factor AuraScore (0–100)**, generates personalized chronobiology AM/PM routines, analyzes INCI ingredient safety and synergies, tracks longitudinal skin barrier progress, and delivers professional consultation workflows.

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)
```bash
# 1. Navigate to project root
cd project_scaffold

# 2. Copy environment template
cp .env.example .env

# 3. Start PostgreSQL, Backend, and Frontend containers
docker compose up -d --build

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Liveness Probe: http://localhost:8000/health/live
# Readiness Probe: http://localhost:8000/health/ready
# Health Check: http://localhost:8000/health
```

---

### Option 2: Run Locally in Development Mode

#### Backend Setup
```bash
cd project_scaffold/backend

# Install python dependencies
pip install -r requirements.txt

# Run database table initialization or migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd project_scaffold/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 🧪 Comprehensive Testing & Verification

### Backend Pytest Suite
```bash
cd project_scaffold/backend
pytest tests/ -v
```
**Results**: `83 passed, 100% test coverage across M1, M2, M3, M4, and Production Readiness suites.`

### Frontend Production Build
```bash
cd project_scaffold/frontend
npm run build
```
**Results**: `0 TypeScript errors, 0 bundling errors, optimized chunk split (<135 kB).`

---

## 📚 Technical & User Documentation
- [Production Readiness & Cloud Specification](docs/PRODUCTION_READINESS.md)
- [Technical Architecture Guide](docs/TECHNICAL_ARCHITECTURE.md)
- [Deployment, Operations & Backup Guide](docs/DEPLOYMENT_AND_OPERATIONS_GUIDE.md)
- [User & Clinician Guide](docs/USER_GUIDE.md)

---

## 🔒 Security & Data Governance
- **Role-Based Access Control**: `USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`
- **Zero Secrets in Code**: Environment configuration managed through `.env.example`
- **Strict Tenant Isolation**: Endpoints prevent horizontal cross-user access
- **Hardened Containers**: Unprivileged system user execution (`auraskin:1001`) in Docker
- **Security Headers**: Content sniffing prevention, clickjacking protection, strict referrer policy, correlation IDs
