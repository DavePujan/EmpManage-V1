# System Credentials & User Accounts

This document contains the complete profile, organizational, role-based access, and login credential details for all **7 system accounts** configured in the **Employee Management System (EmpManage Enterprise)** database according to the latest database migration script ([`script (1).sql`](file:///e:/z_projects/EmployeeManagement-PP/script%20(1).sql) / [`mysql_script.sql`](file:///e:/z_projects/EmployeeManagement-PP/EmpManagementAPI2/mysql_script.sql)).

---

## 👥 Summary of Accounts

| # | Full Name | Username | Email | Role | Department | Team | Designation | Supervisor |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **1** | **system admin** | `Priyanka` | `priyankaaparmar0707@gmail.com` | **Admin** | None | None | System Administrator | None |
| **2** | **parth patel** | `parth` | `230130107078@gecg28.ac.in` | **HR** | HR | Recruitment Team | Recruitment Specialist | system admin (1) |
| **3** | **priya parmar** | `priya` | `priyankaaparmar1234@gmail.com` | **HR** | HR | Payroll Team | Payroll Executive | parth patel (4) |
| **4** | **pujan dave** | `pujan` | `pujan.gate@gmail.com` | **Employee** | IT | Backend Team | Senior Software Developer | priya parmar (4) |
| **5** | **mansi chauhan** | `mansi` | `priyankaaparmar.cloud0707@gmail.com` | **Employee** | Customer Support | Customer Service Team | Support Team Leader | pujan dave (5) |
| **6** | **khushi bhimani** | `khushi` | `priyankaaaaparmar0707@gmail.com` | **Employee** | IT | Backend Team | Backend Developer | pujan dave (5) |
| **7** | **riya maru** | `riya` | `riyarathod0707@gmail.com` | **Employee** | Customer Support | Customer Service Team | Customer Support Executive | system admin (1) |

---

## 📑 Detailed User Profiles

### 1. Priyanka — System Administrator (Admin)
- **User ID (AppUser)**: `1`
- **Employee ID**: `1`
- **Full Name**: `system admin`
- **Username**: `Priyanka`
- **Email**: `priyankaaparmar0707@gmail.com`
- **Role**: `Admin` (Role ID: `1`)
- **Department**: `None`
- **Team**: `None`
- **Designation**: `System Administrator`
- **Supervisor**: `None`
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - Full CRUD control over Employees, Departments, Teams, and Designations.
  - Can activate / deactivate / delete employee records.
  - View organization-wide KPI dashboard metrics.
  - Review, approve, and reject all leave requests across the company.

---

### 2. Parth Patel (HR)
- **User ID (AppUser)**: `3`
- **Employee ID**: `3`
- **Full Name**: `parth patel`
- **Username**: `parth`
- **Email**: `230130107078@gecg28.ac.in`
- **Role**: `HR` (Role ID: `2`)
- **Department**: `HR` (Dept ID: `2`)
- **Team**: `Recruitment Team` (Team ID: `4`)
- **Designation**: `Recruitment Specialist` (Designation ID: `8`)
- **Supervisor**: `system admin` (Employee ID: `1`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View employee directory and department structures.
  - View total employee metrics and workforce directory.
  - Review, approve, and reject leave requests for employees.
  - Submit personal leave requests.

---

### 3. Priya Parmar (HR)
- **User ID (AppUser)**: `4`
- **Employee ID**: `4`
- **Full Name**: `priya parmar`
- **Username**: `priya`
- **Email**: `priyankaaparmar1234@gmail.com`
- **Role**: `HR` (Role ID: `2`)
- **Department**: `HR` (Dept ID: `2`)
- **Team**: `Payroll Team` (Team ID: `5`)
- **Designation**: `Payroll Executive` (Designation ID: `9`)
- **Supervisor**: `priya parmar` / Supervisor ID `4`
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View employee directory and HR department metrics.
  - Review and process leave requests.
  - Submit personal leave requests.

---

### 4. Pujan Dave (Employee / Senior Software Developer)
- **User ID (AppUser)**: `5`
- **Employee ID**: `5`
- **Full Name**: `pujan dave`
- **Username**: `pujan`
- **Email**: `pujan.gate@gmail.com`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `IT` (Dept ID: `1`)
- **Team**: `Backend Team` (Team ID: `1`)
- **Designation**: `Senior Software Developer` (Designation ID: `2`)
- **Supervisor**: `priya parmar` (Employee ID: `4`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Apply for Leave (Sick, Casual, Annual) with dynamic duration calculation.
  - Track leave application status (`Approved` leave record present in database).
  - Update personal profile details.

---

### 5. Mansi Chauhan (Employee / Support Team Leader)
- **User ID (AppUser)**: `6`
- **Employee ID**: `6`
- **Full Name**: `mansi chauhan`
- **Username**: `mansi`
- **Email**: `priyankaaparmar.cloud0707@gmail.com`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `Customer Support` (Dept ID: `6`)
- **Team**: `Customer Service Team` (Team ID: `11`)
- **Designation**: `Support Team Leader` (Designation ID: `22`)
- **Supervisor**: `pujan dave` (Employee ID: `5`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Submit and cancel leave requests (`Cancelled` leave record present in database).
  - Update profile details.

---

### 6. Khushi Bhimani (Employee / Backend Developer)
- **User ID (AppUser)**: `7`
- **Employee ID**: `7`
- **Full Name**: `khushi bhimani`
- **Username**: `khushi`
- **Email**: `priyankaaaaparmar0707@gmail.com`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `IT` (Dept ID: `1`)
- **Team**: `Backend Team` (Team ID: `1`)
- **Designation**: `Backend Developer` (Designation ID: `3`)
- **Supervisor**: `pujan dave` (Employee ID: `5`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Submit and track leave requests.
  - Update personal profile details.

---

### 7. Riya Maru (Employee / Customer Support Executive)
- **User ID (AppUser)**: `8`
- **Employee ID**: `8`
- **Full Name**: `riya maru`
- **Username**: `riya`
- **Email**: `riyarathod0707@gmail.com`
- **Role**: `Employee` (Role ID: `4`)
- **Department**: `Customer Support` (Dept ID: `6`)
- **Team**: `Customer Service Team` (Team ID: `11`)
- **Designation**: `Customer Support Executive` (Designation ID: `20`)
- **Supervisor**: `system admin` (Employee ID: `1`)
- **Account Status**: `Active`
- **Permissions & Capabilities**:
  - View personal employee dashboard.
  - Track leave application status (`Approved` sick leave record present in database).
  - Update profile details.

---

## 🏢 Organizational Structure Reference

### Departments & Teams
| Dept ID | Department Name | Team ID | Team Name |
| :---: | :--- | :---: | :--- |
| **1** | **IT** | 1 | Backend Team |
| | | 2 | Frontend Team |
| | | 3 | QA Team |
| **2** | **HR** | 4 | Recruitment Team |
| | | 5 | Payroll Team |
| **3** | **Finance** | 6 | Accounts Team |
| **4** | **Sales** | 7 | Business Development Team |
| **5** | **Marketing** | 8 | Social Media Team |
| | | 9 | Content Marketing Team |
| | | 10 | Digital Marketing Team |
| **6** | **Customer Support** | 11 | Customer Service Team |
| | | 12 | Technical Support Team |

---

## 🌐 Quick Login Test Instructions

1. Ensure your database is initialized using either [`mysql_script.sql`](file:///e:/z_projects/EmployeeManagement-PP/EmpManagementAPI2/mysql_script.sql) (MySQL) or [`script.sql`](file:///e:/z_projects/EmployeeManagement-PP/EmpManagementAPI2/script.sql) (SQL Server).
2. Ensure the backend API is running on `http://localhost:5084` (`dotnet run` in `EmpManagementAPI2`).
3. Ensure the Angular frontend is running on `http://localhost:4200` (`npm start` in `EmpManagementFrontend`).
4. Open `http://localhost:4200/login` in your browser.
5. Log in using any username from the summary table to test the respective role-based view and permissions.
