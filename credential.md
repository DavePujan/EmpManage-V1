# System Credentials & User Accounts

This document contains the complete profile, organizational, role-based access, and login credential details for all **5 system accounts** configured in the **Employee Management System (EmpManage Enterprise)** database.

---

## 👥 Summary of Accounts

| # | Full Name | Username | Password | Role | Department | Team | Designation | Supervisor |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **1** | **System Administrator** | `admin` | `AdminPassword123!` | **Admin** | Software Engineering | Core Backend Team | System Administrator | None |
| **2** | **Sarah Jenkins** | `sarah_hr` | `HrPassword123!` | **HR** | Human Resources | People Operations | HR Operations Specialist | None |
| **3** | **Michael Scott** | `michael_mgr` | `ManagerPassword123!` | **Manager** | Software Engineering | Core Backend Team *(Team Head)* | Engineering Manager | None |
| **4** | **John Doe** | `john_doe` | `EmployeePassword123!` | **Employee** | Software Engineering | Core Backend Team | Software Developer | Michael Scott |
| **5** | **Emily Davis** | `emily_dev` | `EmployeePassword123!` | **Employee** | Software Engineering | Core Backend Team | Frontend Developer | Michael Scott |

---

## 📑 Detailed User Profiles

### 1. System Administrator (Admin)
- **User ID (AppUser)**: `1`
- **Employee ID**: `1`
- **Full Name**: `System Administrator`
- **Username**: `admin`
- **Email**: `admin@company.com`
- **Password**: `AdminPassword123!`
- **Role**: `Admin` (Role ID: `1`)
- **Department**: `Software Engineering` (Dept ID: `1`)
- **Team**: `Core Backend Team` (Team ID: `1`)
- **Designation**: `Software Developer / System Administrator`
- **Supervisor**: `None`
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - Full CRUD control over Employees, Departments, Teams, and Designations.
  - Can activate / deactivate / delete employee records.
  - View organization-wide KPI dashboard metrics.
  - Review, approve, and reject all leave requests across the company.

---

### 2. Sarah Jenkins (HR)
- **User ID (AppUser)**: `2`
- **Employee ID**: `2`
- **Full Name**: `Sarah Jenkins`
- **Username**: `sarah_hr`
- **Email**: `sarah.jenkins@company.com`
- **Password**: `HrPassword123!`
- **Role**: `HR` (Role ID: `2`)
- **Department**: `Human Resources` (Dept ID: `2`)
- **Team**: `People Operations` (Team ID: `2`)
- **Designation**: `HR Operations Specialist` (Designation ID: `2`)
- **Supervisor**: `None`
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View employee directory and department structures.
  - View total employee metrics and workforce directory.
  - Review, approve, and reject leave requests for all employees.
  - Submit personal leave requests.

---

### 3. Michael Scott (Manager & Team Head)
- **User ID (AppUser)**: `3`
- **Employee ID**: `3`
- **Full Name**: `Michael Scott`
- **Username**: `michael_mgr`
- **Email**: `michael.scott@company.com`
- **Password**: `ManagerPassword123!`
- **Role**: `Manager` (Role ID: `3`)
- **Department**: `Software Engineering` (Dept ID: `1`)
- **Team**: `Core Backend Team` *(Assigned as Team Head)*
- **Designation**: `Engineering Manager` (Designation ID: `3`)
- **Supervisor**: `None`
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View assigned team members (`John Doe`, `Emily Davis`).
  - Access Team Leave tab and Pending Approvals for team members.
  - Submit and manage personal leave applications.
  - Manage personal account profile and credentials.

---

### 4. John Doe (Employee)
- **User ID (AppUser)**: `4`
- **Employee ID**: `4`
- **Full Name**: `John Doe`
- **Username**: `john_doe`
- **Email**: `john.doe@company.com`
- **Password**: `EmployeePassword123!`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `Software Engineering` (Dept ID: `1`)
- **Team**: `Core Backend Team` (Team ID: `1`)
- **Designation**: `Software Developer` (Designation ID: `1`)
- **Supervisor**: `Michael Scott` (Supervisor ID: `3`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Apply for Sick, Casual, or Annual Leave with dynamic duration calculation.
  - Track personal leave application statuses (`Pending`, `Approved`, `Rejected`).
  - Cancel submitted pending leave applications.
  - Update personal profile details and change password.

---

### 5. Emily Davis (Employee)
- **User ID (AppUser)**: `5`
- **Employee ID**: `5`
- **Full Name**: `Emily Davis`
- **Username**: `emily_dev`
- **Email**: `emily.davis@company.com`
- **Password**: `EmployeePassword123!`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `Software Engineering` (Dept ID: `1`)
- **Team**: `Core Backend Team` (Team ID: `1`)
- **Designation**: `Frontend Developer` (Designation ID: `4`)
- **Supervisor**: `Michael Scott` (Supervisor ID: `3`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Apply for Sick, Casual, or Annual Leave with dynamic duration calculation.
  - Track personal leave application statuses (`Pending`, `Approved`, `Rejected`).
  - Cancel submitted pending leave applications.
  - Update personal profile details and change password.

---

## 🌐 Quick Login Test Instructions

1. Ensure the backend API is running on `http://localhost:5084` (`dotnet run` in `EmpManagementAPI2`).
2. Ensure the Angular frontend is running on `http://localhost:4200` (`npm start` in `EmpManagementFrontend`).
3. Open `http://localhost:4200/login` in your browser.
4. Log in using any of the usernames and passwords listed above to test the respective role-based view and permissions.
