# ECO TRACK — Complete Employee Management System

> **Tagline:** Track Employees. Manage Work. Drive Performance.

ECO TRACK is a production-grade, enterprise SaaS Employee Management System engineered to centralize employee records, departments, attendance, shifts, leave requests, payroll processing, performance goals, documents, assets, and audit compliance within one cohesive platform.

---

## 🌟 Key Modules & Features

- **Role-Based Access Control (4 Roles):**
  - **ADMIN:** Full control over employees, hierarchy, shifts, leaves, payroll locking, assets, audit trails, and global system settings.
  - **HR:** Profile management, attendance review, leave approval workflow, payroll preparation, announcements, and executive reports.
  - **MANAGER:** Direct team members directory, team attendance tracking, team leave approvals, KPI goal creation, and performance reviews.
  - **EMPLOYEE:** Self-service portal: Check-In/Check-Out with live timer, attendance logs, leave balance quotas, salary slip viewing & PDF download, goal progress, and document management.
- **Enterprise Visual Design:**
  - Modern dashboard cards with Lucide React iconography.
  - Corporate Red accent (`#DC2626`) on Charcoal Black sidebar (`#0F172A`) and light/dark theme toggle.
  - Interactive Recharts analytics (Department distribution donut, 7-day attendance trends, and payroll expenditure area charts).
- **Employee Directory & 9-Tab Profile:**
  - Unique Employee ID validation (e.g. `ECO-1001`).
  - Search by name, ID, email, phone, and filters for department and employment status.
  - Comprehensive 9-tab profile view: Personal Info, Employment Placement, Attendance History, Leave Balances, Payroll & Slips, Performance & Goals, Documents, Assigned Assets, and Career History.
  - Sensitive banking and compensation masking based on user role permissions.
  - Soft deactivation/archival to preserve historical payroll and attendance integrity.
- **Printable Employee ID Card Generator:**
  - Physical badge dimensions with corporate branding, photo avatar, details, and dynamic QR verification code.
  - One-click browser print and vector PDF download.
- **Attendance & Shift Management:**
  - Live clock Check-In & Check-Out with server-side grace period, late arrival calculation, early departure, and overtime hours.
  - Prevention of duplicate check-ins or checking out without an open session.
  - Employee attendance correction requests with audit history and manager sign-off.
- **Leave Management & Approval Workflows:**
  - Configurable leave types (Casual, Sick, Paid/Earned, Emergency, Unpaid).
  - Real-time balance quotas, prevention of overlapping dates, and half-day options (0.5 day).
  - Multi-tier approval workflow (Employee → Manager/HR Approval) with automatic attendance synchronization.
- **Payroll & Salary Slips:**
  - Flexible earnings (Basic, HRA, Conveyance, Medical, Special, Overtime, Bonus) and statutory deductions (PF, Tax, Insurance, Unpaid Leave).
  - Lifecycle: `Draft` → `Review` → `Approved` → `Finalized (Locked)`.
  - Professional PDF Salary Slip generator with earnings/deductions breakdown and official company seal.
- **Performance & KPI Goals:**
  - Quarterly milestones, target metrics, progress sliders, and review comments.
  - 360 evaluations with 6 core competencies (Productivity, Technical Skills, Communication, Teamwork, Quality, Leadership) rated 1 to 5.
- **Document Repository:**
  - Secure storage for Resumes, Offer Letters, Certificates, and Employment contracts.
  - Role-authorized download endpoints preventing raw public access.
- **Company Asset Management:**
  - Hardware inventory (MacBooks, Dells, RFID badges, peripherals) with serial numbers, checkout assignments, and return conditions.
- **Audit Logs & Security:**
  - Immutable compliance event logs tracking logins, failed attempts, employee record mutations, leave approvals, and payroll finalizations.
  - bcrypt password hashing, short-lived JWT tokens, rate limiting, and Helmet headers.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router v7, Axios, Lucide React, Recharts, jsPDF, html2canvas, XLSX, qrcode.react.
- **Backend:** Node.js (v20+), Express.js 4, Mongoose 8, bcryptjs, jsonwebtoken, express-rate-limit, helmet, multer, compression, morgan.
- **Database:** MongoDB / MongoDB Atlas. In development, the backend automatically boots an embedded MongoDB engine if no local or Atlas MongoDB is detected.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9 or higher)

### 2. Clone and Configure Environment

```bash
# In the project root, duplicate the environment template
copy .env.example backend\.env
```

Default `backend/.env` contents:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=auto
JWT_SECRET=eco_track_dev_jwt_secret_987654321_secure_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
COMPANY_NAME=ECO TRACK
COMPANY_TIMEZONE=UTC
UPLOAD_PATH=./uploads
MAX_FILE_SIZE_MB=10
```
*(Setting `MONGODB_URI=auto` spins up an embedded, zero-configuration MongoDB engine out of the box).*

---

### 3. Seed Demo Data

To populate the database with realistic fictional departments, employees across all 4 roles, shifts, holidays, attendance records, leaves, payroll, and assets:

```bash
cd backend
npm run seed
```

#### Demo Credentials Table:
| Role | Email | Password | Scope |
|---|---|---|---|
| **👑 ADMIN** | `admin@ecotrack.internal` | `Admin@Eco2026` | Full administrative control |
| **👥 HR** | `hr@ecotrack.internal` | `Hr@Eco2026` | Staffing, leaves, payroll, reports |
| **👔 MANAGER** | `manager@ecotrack.internal` | `Manager@Eco2026` | Team attendance, leaves, reviews |
| **💻 EMPLOYEE** | `alex@ecotrack.internal` | `Employee@Eco2026` | Self check-in, leaves, salary slips |

*(The login screen also provides 1-click preset buttons to instantly fill and sign into any role).*

---

### 4. Create a Clean Initial Administrator (Production Setup)

To bootstrap your own production administrator with custom credentials:

```bash
cd backend
npm run create-admin
```
Follow the interactive prompts to securely register your custom administrator.

---

### 5. Running the Application

In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# API server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite client starts on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Automated Testing

ECO TRACK includes unit and integration tests covering authentication security, JWT token verification, attendance calculations, grace periods, overtime, leave overlap algorithms, and payroll arithmetic.

To run all automated tests:

```bash
cd backend
npm test
```

Expected output:
```
✔ Attendance Service - timeToMinutes
✔ Attendance Service - On-time Check In within Grace Period
✔ Attendance Service - Late Arrival Detection
✔ Attendance Service - Early Departure & Overtime Calculation
✔ Auth Security - Password Hashing with bcrypt
✔ Auth Security - JWT Signing & Verification
✔ Payroll Service - Salary Calculation Logic
✔ Leave Service - Date Overlap Check Algorithm
# pass 8
# fail 0
```

---

## 📡 REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve active authenticated user session.
- `POST /api/auth/change-password` — Update user password.
- `POST /api/auth/forgot-password` — Request password reset token.
- `POST /api/auth/reset-password` — Apply new password via reset token.
- `POST /api/auth/logout` — Terminate session and record audit event.

### Employees (`/api/employees`)
- `GET /api/employees` — Search, filter, and paginate employee records.
- `POST /api/employees` — Onboard a new employee (ADMIN, HR).
- `GET /api/employees/:id` — Retrieve full 9-tab profile.
- `PUT /api/employees/:id` — Update profile details.
- `PATCH /api/employees/:id/status` — Soft-deactivate/archive employee.

### Attendance (`/api/attendance`)
- `POST /api/attendance/check-in` — Record daily check-in with late calculation.
- `POST /api/attendance/check-out` — Record check-out and compute total working hours.
- `GET /api/attendance/today` — Current session status.
- `GET /api/attendance/me` — Employee personal monthly attendance.
- `GET /api/attendance` — Master company register with filters (ADMIN, HR, MANAGER).
- `POST /api/attendance/adjustments` — Request attendance correction.

### Leave (`/api/leaves`)
- `GET /api/leaves/types` — List configured leave types.
- `GET /api/leaves/balance` — Annual allocated, used, and remaining balances.
- `POST /api/leaves` — Apply for leave with overlap validation.
- `POST /api/leaves/:id/approve` — Approve request and sync attendance register.
- `POST /api/leaves/:id/reject` — Reject request and restore pending quota.
- `POST /api/leaves/:id/cancel` — Cancel pending/approved request.

### Payroll (`/api/payroll`)
- `POST /api/payroll/generate` — Batch calculate monthly payroll.
- `GET /api/payroll` — List payroll cycles with filters and summary totals.
- `GET /api/payroll/:id` — Detailed statement and salary slip data.
- `PUT /api/payroll/:id` — Edit draft calculations.
- `POST /api/payroll/:id/approve` — Approve payroll cycle (ADMIN, HR).
- `POST /api/payroll/:id/finalize` — Finalize and lock period (ADMIN).

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/employees` — Headcount & department distribution.
- `GET /api/reports/attendance` — Shift adherence & overtime reports.
- `GET /api/reports/leaves` — Utilization and absence rates.
- `GET /api/reports/payroll` — Gross vs net expenditure analytics.

---

## 🐳 Docker Deployment

To spin up the complete containerized stack (MongoDB 7.0 + Node API Backend + NGINX Frontend):

```bash
docker-compose up --build -d
```
Access the application at `http://localhost:5173`.

---

## 🔒 Security Architecture

1. **Password Protection:** Uses `bcryptjs` with 10 salt rounds. Plaintext passwords are never persisted.
2. **Role Authorization:** Backend RBAC middleware checks `req.user.role` on every protected endpoint. Hiding frontend buttons is never relied upon as security.
3. **Record Ownership Enforcement:** Prevents ID tampering in URLs; employees cannot view peers' private profiles, bank accounts, or salary slips.
4. **Brute Force Protection:** Strict rate-limiting (`express-rate-limit`) on login and password reset routes.
5. **Private Document Storage:** Files uploaded via Multer are saved in a private storage directory and streamed solely via authenticated endpoints.
6. **Immutable Audit Trail:** Critical events are recorded with actor, IP, timestamp, and metadata into non-updatable audit collections.

---

## 📄 License
This project is licensed under the MIT License — ECO TRACK Enterprise.
