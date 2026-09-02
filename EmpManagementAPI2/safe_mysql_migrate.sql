-- ============================================================================
-- Safe Migration & Data Merger for EmpManagement2DB in MySQL
-- Preserves existing data while adding all new departments, teams, designations,
-- users, employees, designations, and leave requests from script (1).sql
-- ============================================================================

USE `EmpManagement2DB`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure Roles (1: Admin, 2: HR, 3: Manager, 4: Employee)
INSERT IGNORE INTO `Roles` (`Id`, `Name`, `Description`) VALUES
(1, 'Admin', 'Has full access to the system and can manage employees, roles, departments, teams and other settings.'),
(2, 'HR', 'Can manage employees and handle employee leave requests but cannot assign roles.'),
(3, 'Manager', 'Can manage their team and handle individual employee leave requests according to company policy.'),
(4, 'Employee', 'Can view their information and submit their own leave requests.');

-- 2. Insert Additional Departments
INSERT IGNORE INTO `Departments` (`Id`, `Name`, `Description`, `IsActive`) VALUES
(1, 'Software Engineering', 'Software Engineering and Information Technology', 1),
(2, 'Human Resources', 'Human Resources and People Operations', 1),
(3, 'Finance', 'Finance and Accounts Department', 1),
(4, 'Sales', 'Sales and Business Development Department', 1),
(5, 'Marketing', 'Marketing and Brand Management Department', 1),
(6, 'Customer Support', 'Customer Support and Service Department', 1);

-- 3. Insert All Designations
INSERT IGNORE INTO `Designations` (`Id`, `Name`, `Description`, `IsActive`) VALUES
(1, 'Software Developer', 'Develops and maintains software applications', 1),
(2, 'HR Operations Specialist', 'Oversees talent relations and employee benefits', 1),
(3, 'Engineering Manager', 'Leads backend development and architecture team', 1),
(4, 'Frontend Developer', 'Develops and maintains user interfaces and frontend applications', 1),
(5, 'QA Engineer', 'Tests software applications and identifies defects', 1),
(6, 'HR Executive', 'Handles employee and human resource activities', 1),
(7, 'HR Manager', 'Manages human resource operations and employee activities', 1),
(8, 'Recruitment Specialist', 'Handles employee recruitment and hiring activities', 1),
(9, 'Payroll Executive', 'Manages employee payroll and salary-related activities', 1),
(10, 'Accountant', 'Handles accounting and financial records', 1),
(11, 'Senior Accountant', 'Manages accounting operations and financial reporting', 1),
(12, 'Financial Analyst', 'Analyzes financial data and prepares financial reports', 1),
(13, 'Sales Executive', 'Handles sales activities and customer relationships', 1),
(14, 'Senior Sales Executive', 'Manages sales activities and key customer accounts', 1),
(15, 'Business Development Executive', 'Identifies new business opportunities and develops client relationships', 1),
(16, 'Marketing Executive', 'Handles marketing campaigns and promotional activities', 1),
(17, 'Digital Marketing Specialist', 'Manages digital marketing campaigns and online promotions', 1),
(18, 'Social Media Executive', 'Manages social media platforms and social media campaigns', 1),
(19, 'Content Strategist', 'Plans and manages marketing content strategies', 1),
(20, 'Customer Support Executive', 'Handles customer queries and support requests', 1),
(21, 'Technical Support Engineer', 'Provides technical assistance and resolves technical issues', 1),
(22, 'Support Team Leader', 'Leads customer support operations and manages support staff', 1),
(23, 'Team Leader', 'Leads and manages a team', 1),
(24, 'Assistant Manager', 'Supports department management and operational activities', 1),
(25, 'Department Manager', 'Manages department operations and employees', 1),
(26, 'Senior Software Developer', 'Develops complex applications and provides technical guidance', 1),
(27, 'Backend Developer', 'Develops and maintains server-side applications and APIs', 1);

-- 4. Insert Additional Teams
INSERT IGNORE INTO `Teams` (`Id`, `Name`, `DepartmentId`, `TeamHeadEmployeeId`, `IsActive`) VALUES
(1, 'Core Backend Team', 1, 3, 1),
(2, 'People Operations', 2, NULL, 1),
(3, 'QA Team', 1, NULL, 1),
(4, 'Recruitment Team', 2, NULL, 1),
(5, 'Payroll Team', 2, NULL, 1),
(6, 'Accounts Team', 3, NULL, 1),
(7, 'Business Development Team', 4, NULL, 1),
(8, 'Social Media Team', 5, NULL, 1),
(9, 'Content Marketing Team', 5, NULL, 1),
(10, 'Digital Marketing Team', 5, NULL, 1),
(11, 'Customer Service Team', 6, NULL, 1),
(12, 'Technical Support Team', 6, NULL, 1);

-- 5. Insert New AppUsers (IDs 6 to 12)
INSERT IGNORE INTO `AppUsers` (`Id`, `Username`, `Email`, `PasswordHash`, `PasswordSalt`, `IsActive`, `CreatedAt`) VALUES
(6, 'Priyanka', 'priyankaaparmar0707@gmail.com', UNHEX('EBEC0CF5F3F44B85A3883DB72F63138F435E500D1CF92ACCF413954968A8DB404929F512B75A8DCBC6DA45EBEA8DBC9EE03D99C3AF0295D2455A4EEF53A28CE1'), UNHEX('2475496C6BA37FAC8FAD3AC5010286F9AB5098A7FF93FC6747BA8F3C82A8AE48'), 1, '2026-08-26 06:36:58.840676'),
(7, 'parth', '230130107078@gecg28.ac.in', UNHEX('3D0068F17BE4C0F032579A80B92C869F652BD4C3755247C793C97F9B5D337728F119C4E69D6C062CC5936A4A8485E7D8EDE35D6B9BFAAC4D2B7261FD332F8077'), UNHEX('F772C222648ACDEE615AD0D00357633027116D0CAD6AC0F5549459B526B90D40'), 1, '2026-08-26 09:48:56.202255'),
(8, 'priya', 'priyankaaparmar1234@gmail.com', UNHEX('6FA613BFD2F1B7F85008B8126A15C603A2D04D6E116CB7DE13EB1B0471B2B50AC7619EBED5E9B3393DC03C6D3C43B70971995C1799829AE24FBEF9AB3BC04615'), UNHEX('733FAE4A2F1786C19F1EACA8E614332B6E3100DFD44AFAF5834F83B581CC4FE6'), 1, '2026-08-26 10:19:16.578787'),
(9, 'pujan', 'pujan.gate@gmail.com', UNHEX('955EF1E928689C84138B0422481FD7448231F956BC4192A222377BC59DC8A32183AB1B0C68C0187A24CF7FDD828749761A36DB59958C9D033D8FFD599D8D35E8'), UNHEX('EA9AB6882BF2E52D46889686E1DF148727949CDCC49AD0456364C051C20F5501'), 1, '2026-08-26 10:29:17.058181'),
(10, 'mansi', 'priyankaaparmar.cloud0707@gmail.com', UNHEX('FDBFB2BC24F204E32FDCBEDD8495718E124450281862ACA89F82791D93C03904D55B44ECE34C883ADA9A5568BFAD1772FD8F9F0F9DD79D618EB5B07AA8B9A761'), UNHEX('A8E21B48DF9C839F455828978432A0334222207C3BD4A75A4CFE307C6C0B8514'), 1, '2026-08-26 10:37:05.901711'),
(11, 'khushi', 'priyankaaaaparmar0707@gmail.com', UNHEX('E5CEB5A941FAD6CCEF4F5B218279C1F4D63128B24D426B82CC59DF8E4608AC02AD7DA03CC651915EB01C2F2826079A57C909FFC56719C054A07F94059D456900'), UNHEX('194A5E1AEFFBFA8FF4B61F5DE46CCFA45857DFF39660897F0100A0B343CBB818'), 1, '2026-08-26 10:43:49.926187'),
(12, 'riya', 'riyarathod0707@gmail.com', UNHEX('881EF5A8ACDBF257B821C23CEA040F11126983B3EB33A2A73F8E8A0BB52EC29EBB4B4CA5D9FB3C068CDB617B6B1C1A28DFEF3FE151D0A2AD28EBC31CAF7B3AE5'), UNHEX('EAB630DA3C8D240F93A3C6F05E29FBB7245F8D89BA998E21C9E56C9EE353B642'), 1, '2026-08-26 10:51:26.085248');

-- 6. Insert New Employees (IDs 6 to 12)
INSERT IGNORE INTO `Employees` (`Id`, `AppUserId`, `Name`, `Email`, `DepartmentId`, `TeamId`, `SupervisorId`, `JoiningDate`, `IsActive`) VALUES
(6, 6, 'system admin (Priyanka)', 'priyankaaparmar0707@gmail.com', NULL, NULL, NULL, '2026-08-26 06:36:59.056155', 1),
(7, 7, 'parth patel', '230130107078@gecg28.ac.in', 2, 4, 6, '2026-08-26 09:48:56.396651', 1),
(8, 8, 'priya parmar', 'priyankaaparmar1234@gmail.com', 2, 5, 7, '2026-08-26 10:19:16.586755', 1),
(9, 9, 'pujan dave', 'pujan.gate@gmail.com', 1, 1, 8, '2026-08-26 10:29:17.062276', 1),
(10, 10, 'mansi chauhan', 'priyankaaparmar.cloud0707@gmail.com', 6, 11, 9, '2026-08-26 10:37:05.905918', 1),
(11, 11, 'khushi bhimani', 'priyankaaaaparmar0707@gmail.com', 1, 1, 9, '2026-08-26 10:43:49.931911', 1),
(12, 12, 'riya maru', 'riyarathod0707@gmail.com', 6, 11, 6, '2026-08-26 10:51:26.089049', 1);

-- 7. Insert Employee Designations
INSERT IGNORE INTO `EmployeeDesignations` (`EmployeeId`, `DesignationId`) VALUES
(6, 1),
(7, 8),
(8, 9),
(9, 26),
(10, 22),
(11, 27),
(12, 20);

-- 8. Insert User Roles
INSERT IGNORE INTO `UserRoles` (`UserId`, `RoleId`) VALUES
(6, 1),
(7, 2),
(8, 2),
(9, 4),
(10, 4),
(11, 4),
(12, 4);

-- 9. Insert Leave Requests
INSERT IGNORE INTO `LeaveRequests` (`Id`, `EmployeeId`, `LeaveType`, `Reason`, `StartDate`, `EndDate`, `Status`, `IsTeamLeave`, `TeamId`, `ApprovedBy`, `ApprovedDate`, `CreatedAt`) VALUES
(2, 9, 'Casual Leave', 'Personal work', '2026-08-28 00:00:00.000000', '2026-08-29 00:00:00.000000', 'Approved', 0, NULL, 7, '2026-08-26 12:52:32.392045', '2026-08-26 12:45:44.402029'),
(3, 12, 'Sick Leave', 'Not feeling well', '2026-09-02 00:00:00.000000', '2026-09-03 00:00:00.000000', 'Approved', 0, NULL, 7, '2026-08-26 13:04:08.787487', '2026-08-26 13:02:18.512420'),
(4, 10, 'Casual Leave', 'Personal work', '2026-09-03 00:00:00.000000', '2026-09-04 00:00:00.000000', 'Cancelled', 0, NULL, NULL, NULL, '2026-09-01 07:37:10.455516');

SET FOREIGN_KEY_CHECKS = 1;
