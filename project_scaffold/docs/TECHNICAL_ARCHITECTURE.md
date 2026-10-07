# AuraSkin AI Skin Intelligence & Personalized Skincare Planner
## Milestone 4: Final Technical Architecture Specification

---

## 1. Executive System Overview
**AuraSkin** is an enterprise-grade, clinical-grade dermatological AI intelligence and personalized chronobiology skincare platform. The platform ingests multimodal skin diagnostics, lifestyle telemetry, sleep staging, hydration metrics, and environmental UV exposure to compute an explainable, 5-factor composite **AuraScore (0–100)**. 

Through its INCI chemical analyzer and biocompatibility matching engine, AuraSkin recommends personalized morning, evening, and weekly regimens, identifies ingredient contraindications and synergies, monitors longitudinal progress, and enables licensed dermatologists and skincare consultants to deliver verified clinical oversight.

```
+-----------------------------------------------------------------------------------------+
|                                     AURASKIN CLIENT                                     |
|                         (React 18 + TypeScript + Vite + Tailwind/CSS)                   |
+-----------------------------------------------------------------------------------------+
                                             |
                                  REST APIs / JSON / JWT
                                             |
+-----------------------------------------------------------------------------------------+
|                               FASTAPI APPLICATION GATEWAY                               |
|                  (Python 3.11 + Uvicorn + Pydantic v2 + Structured Logs)                |
+-----------------------------------------------------------------------------------------+
    |                    |                    |                     |                   |
    v                    v                    v                     v                   v
+--------------+ +---------------+ +------------------+ +-----------------+ +-------------+
| Auth & RBAC  | | Scoring Engine| |  Product & INCI  | | Notifications & | |  Reports &  |
|  (JWT/OAuth) | | (5-Factor/100)| |  (Safety/Matrix) | | Smart Reminders | | (PDF/Excel) |
+--------------+ +---------------+ +------------------+ +-----------------+ +-------------+
                                             |
                                  SQLAlchemy 2.0 ORM
                                             |
+-----------------------------------------------------------------------------------------+
|                              POSTGRESQL 16 PERSISTENT DB                                |
|           (Users, Profiles, Routines, Scores, Telemetry, Progress, Notifications)       |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems & Engines

### 2.1. 5-Factor Dermal Health Scoring Engine (AuraScore)
The composite AuraScore mathematically fuses 5 clinical dimensions ($0 \le \text{AuraScore} \le 100$):

$$\text{AuraScore} = S_{\text{condition}} + S_{\text{lifestyle}} + S_{\text{sleep}} + S_{\text{routine}} + S_{\text{hydration}}$$

| Component | Maximum Points | Clinical Target & Weighting |
| :--- | :---: | :--- |
| **Skin Condition Baseline** | **35 pts** | Skin barrier integrity, hydration level, oil balance, reported clinical concerns (acne, redness, sensitivity). |
| **Lifestyle & Stress** | **20 pts** | Stress levels (Low: 20pts, Moderate: 14pts, High: 7pts), smoking, diet quality. |
| **Sleep Restoration** | **15 pts** | Sleep duration ($\ge 8\text{h}: 15\text{pts}$, $7\text{h}: 12\text{pts}$, $<6\text{h}: 6\text{pts}$) and REM quality score. |
| **Routine Consistency** | **20 pts** | Regimen adherence rate over 14-day rolling window. |
| **Hydration Level** | **10 pts** | Daily water intake ($\ge 2500\text{ml}: 10\text{pts}$, $2000\text{ml}: 8\text{pts}$, $<1500\text{ml}: 4\text{pts}$). |

---

### 2.2. INCI Scanner & Chemical Interaction Intelligence
- **4-Tier Safety Classification**: Every cosmetic ingredient is mapped to safety tiers:
  1. `BENIGN`: Biocompatible, non-irritating, soothing (e.g., *Glycerin, Centella Asiatica, Allantoin*).
  2. `MODERATE`: Active treatment requiring controlled concentration (e.g., *Niacinamide 10%, L-Ascorbic Acid*).
  3. `HAZARDOUS`: High allergen/sensitizer potential (e.g., *Synthetic Fragrance, Denatured Alcohol, Sulfates*).
  4. `RESTRICTED`: Clinical contraindications requiring medical caution.
- **Cross-Ingredient Interaction Matrix**: Detects chemical conflicts (e.g., *Retinol + AHAs/BHAs* causing barrier destabilization) and synergies (e.g., *Niacinamide + Salicylic Acid* or *Vitamin C + Vitamin E + Ferulic Acid*).

---

### 2.3. Notification & Automated Smart Reminder System
- **Persistence Model**: `notifications` table storing title, message, type, priority, read status, and action links.
- **Preference Matrix**: `notification_preferences` with granular toggles for In-App, Email, AM/PM routine, Hydration, Sleep, Replenishment, and Milestones.
- **Automated Trigger Evaluation**:
  - `AM_ROUTINE`: Fires if morning routine uncompleted by midday.
  - `PM_ROUTINE`: Fires for nighttime active application and barrier repair.
  - `HYDRATION`: Fires if rolling 24h intake is below 2000ml.
  - `SLEEP`: Dispatches barrier recovery advisory if sleep is $<6.5\text{h}$.
  - `MILESTONE`: Celebrates 3, 7, 14, 30, and 90-day adherence streaks.
  - `REPLENISHMENT`: Warns when 30-day active products are low on supply.

---

### 2.4. Reports & Clinical Export Layer
- **Standardized Reports**:
  1. Skin Assessment Report (`/api/reports/assessment`)
  2. AuraScore 5-Factor Report (`/api/reports/aurascore`)
  3. Personalized Routine Protocol (`/api/reports/routine`)
  4. Product Recommendation Report (`/api/reports/products`)
  5. Ingredient Safety Report (`/api/reports/safety`)
  6. Progress & Longitudinal Report (`/api/reports/progress`)
  7. Before/After Comparison Report (`/api/reports/before-after`)
  8. Comprehensive 18-Point Clinical Intelligence Report (`/api/reports/comprehensive`)
- **Native PDF Export**: Built using `ReportLab`, producing branded vector PDFs with headers, clinical tables, scoring breakdowns, routines, and safety notes.
- **Multi-Sheet Excel Export**: Built using `openpyxl`, generating `.xlsx` workbooks with Assessment, 5-Factor Score, Regimen, Adherence Logs, and Progress history.

---

## 3. Role-Based Access Control (RBAC) & Security Architecture

| Role | Permissions & Scope |
| :--- | :--- |
| **`USER`** | Read/write own profile, telemetry, assessments, scores, routines, adherence, notifications, and export own reports. Strict cross-user isolation enforced. |
| **`SKINCARE_CONSULTANT`** | Verified professionals can browse client directory, view authorized client skin reports, examine client telemetry and progress history, and respond to consultation requests. |
| **`DERMATOLOGIST`** | Clinical specialist role. Access to authorized client diagnostic reports, allergy contraindications, longitudinal progress trends, and consultation management. |
| **`ADMIN`** | Platform governance. View platform analytics, audit user registry, manage and verify professional registrations, and inspect system operational health. |

---

## 4. Operational Observability & Health Endpoints
- **Simple Liveness Probe**: `GET /health` $\rightarrow$ `{"status": "ok"}`
- **Operational Deep Health Check**: `GET /api/health` $\rightarrow$
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "version": "4.0.0",
    "timestamp": "2026-10-02T12:00:00Z",
    "services": {
      "auth": "operational",
      "scoring_engine": "operational",
      "intelligence": "operational",
      "notifications": "operational",
      "reports": "operational"
    }
  }
  ```
- **Performance Middleware**: Latency measured via `X-Process-Time-Ms` response header and structured request logging.
