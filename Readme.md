# Employee Management System (EmpManage Enterprise)

A complete, enterprise-grade Employee & Leave Management System featuring an **ASP.NET Core (.NET 8.0) Web API** backend connected to **MySQL**, paired with a modern, standalone **Angular 19** frontend dashboard.

[![GitHub Repo](https://img.shields.io/badge/GitHub-DavePujan%2FEmpManage--V1-181717?logo=github)](https://github.com/DavePujan/EmpManage-V1.git)
[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular 19](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.dev/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

---

## 🚀 Quick Clone & Start

```bash
git clone https://github.com/DavePujan/EmpManage-V1.git
cd EmpManage-V1
```

## 🏗️ Project Architecture

```
EmployeeManagement-PP/
├── EmpManagementAPI2/       # ASP.NET Core 8.0 Web API (Backend)
│   ├── Controllers/         # REST API Controllers (Auth, Employee, Department, Team, etc.)
│   ├── Data/                # EF Core AppDbContext & MySQL Configurations
│   ├── DTOs/                # Data Transfer Objects & Payloads
│   ├── Services/            # Business Logic & Validation Services
│   └── appsettings.json     # DB Connection String & JWT Configuration
│
├── EmpManagementFrontend/   # Standalone Angular 19 Single Page App (Frontend)
│   ├── src/app/core/        # Auth, JWT Interceptor, RBAC Guards, State Services
│   ├── src/app/api/         # Strongly Typed REST API Client Services
│   ├── src/app/shared/      # Reusable UI Components (Cards, Modals, Badges, Icons)
│   ├── src/app/layout/      # App Shell, Responsive Sidebar, Header, User Menu
│   ├── src/app/features/    # Dashboard, Employees, Departments, Teams, Leaves, Profile
│   └── src/proxy.conf.json  # Reverse proxy forwarding /api to port 5084
│
└── Readme.md                # Project Documentation & Getting Started Guide
```

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed on your machine:

1. **.NET 8.0 SDK** ([Download .NET 8](https://dotnet.microsoft.com/download/dotnet/8.0))
2. **Node.js (v18+ or v20+) & NPM** ([Download Node.js](https://nodejs.org/))
3. **MySQL Server 8.0+** running locally on port `3306`

---

## 🗄️ Database Configuration

1. Make sure your local MySQL service is running on port `3306`.
2. The backend connects to MySQL database `EmpManagement2DB` with user `root` and password `root` by default in `EmpManagementAPI2/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Port=3306;Database=EmpManagement2DB;User=root;Password=root;"
   }
   ```
3. To apply the Entity Framework database migrations and seed initial roles:
   ```powershell
   cd e:\z_projects\EmployeeManagement-PP\EmpManagementAPI2
   dotnet ef database update
   ```

---

## 🚀 How to Start the Application

### Step 1: Start the Backend API

Open a terminal window and execute:

```powershell
cd e:\z_projects\EmployeeManagement-PP\EmpManagementAPI2
dotnet run
```

- **Backend API Base URL**: `http://localhost:5084`
- **Swagger API Docs**: `http://localhost:5084/swagger`

---

### Step 2: Start the Angular Frontend

Open a **separate** terminal window and execute:

```powershell
cd e:\z_projects\EmployeeManagement-PP\EmpManagementFrontend
npm start
```

- **Frontend Application URL**: `http://localhost:4200`
- The development server automatically proxies all `/api/*` requests to the backend at `http://localhost:5084/api/*` (no manual CORS configuration needed).

---

### Database Scripts:
- **MySQL 8.0+**: Execute [`EmpManagementAPI2/mysql_script.sql`](file:///e:/z_projects/EmployeeManagement-PP/EmpManagementAPI2/mysql_script.sql) in MySQL Workbench or phpMyAdmin.
- **SQL Server**: Execute [`EmpManagementAPI2/script.sql`](file:///e:/z_projects/EmployeeManagement-PP/EmpManagementAPI2/script.sql) or [`script (1).sql`](file:///e:/z_projects/EmployeeManagement-PP/script%20(1).sql) in SSMS / Azure Data Studio.

---

## 🔑 Seeded User Accounts

Once the database is initialized and both servers are running, log in with any of the accounts below:

| Role | Username | Full Name | Department / Team |
| :--- | :--- | :--- | :--- |
| **Admin** | `Priyanka` | system admin | *Organization Admin* |
| **HR** | `parth` | parth patel | HR / Recruitment Team |
| **HR** | `priya` | priya parmar | HR / Payroll Team |
| **Employee** | `pujan` | pujan dave | IT / Backend Team |
| **Employee** | `mansi` | mansi chauhan | Customer Support / Customer Service Team |
| **Employee** | `khushi` | khushi bhimani | IT / Backend Team |
| **Employee** | `riya` | riya maru | Customer Support / Customer Service Team |

*(For full details, profiles, and supervisor hierarchies, see [`credential.md`](file:///e:/z_projects/EmployeeManagement-PP/credential.md).)*

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Feature / Page | Admin | HR | Manager | Employee |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard Metrics & Overview** | ✅ | ✅ | ✅ | ✅ (Personal) |
| **View Employees Directory** | ✅ | ✅ | ❌ | ❌ |
| **Add / Edit / Delete Employees** | ✅ | ❌ | ❌ | ❌ |
| **Toggle Employee Active/Inactive** | ✅ | ❌ | ❌ | ❌ |
| **View Departments & Teams** | ✅ | ✅ | ❌ | ❌ |
| **Create Departments & Teams** | ✅ | ❌ | ❌ | ❌ |
| **Manage Designations** | ✅ | ❌ | ❌ | ❌ |
| **Apply for Leave / My Leaves** | ✅ | ✅ | ✅ | ✅ |
| **Approve / Reject Leaves** | ✅ | ✅ | ❌ | ❌ |
| **View Team Leaves / Pending Leaves** | ✅ | ✅ | ✅ | ❌ |
| **My Profile & Change Password** | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Tech Stack Details

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: Oracle MySQL 8.0 via `Pomelo.EntityFrameworkCore.MySql`
- **Authentication**: JWT Bearer Tokens with Role Claims
- **Password Security**: Cryptographic Salted Hashing (`PBKDF2` / `HMAC-SHA256`)
- **Documentation**: Swagger / OpenAPI with Bearer Authorization

### Frontend
- **Framework**: Angular 19+ (Standalone Components, Signals & Reactive State)
- **Styling**: SCSS Design System (Custom Tokens, Rounded UI, Elevation Shadows)
- **Primary Color Palette**: Rose/Pink (`#F43F5E`), Deep Slate (`#0F172A`), Emerald (`#009963`)
- **HTTP Layer**: Functional Interceptors with automated JWT Bearer injection and centralized error notifications
- **Routing**: Lazy-loaded feature routes with `authGuard`, `roleGuard`, and `guestGuard`
