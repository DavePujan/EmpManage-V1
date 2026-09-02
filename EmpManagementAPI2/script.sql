-- ============================================================================
-- SQL Server Database Migration & Seed Script for Employee Management API (EmpManagement2DB)
-- Fully compatible with Microsoft SQL Server 2019+, Azure SQL, and SSMS
-- Synchronized with script (1).sql
-- ============================================================================

USE [master];
GO

-- 1. Create Database if it does not already exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EmpManagement2DB')
BEGIN
    CREATE DATABASE [EmpManagement2DB];
END
GO

USE [EmpManagement2DB];
GO

-- ============================================================================
-- 2. Create Tables
-- ============================================================================

-- EF Core Migrations History
IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[__EFMigrationsHistory](
        [MigrationId] [nvarchar](150) NOT NULL,
        [ProductVersion] [nvarchar](32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId] ASC)
    );
END
GO

-- Roles
IF OBJECT_ID(N'[dbo].[Roles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Roles](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](max) NOT NULL,
        [Description] [nvarchar](max) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- AppUsers
IF OBJECT_ID(N'[dbo].[AppUsers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AppUsers](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Username] [nvarchar](max) NOT NULL,
        [Email] [nvarchar](max) NOT NULL,
        [PasswordHash] [varbinary](max) NOT NULL,
        [PasswordSalt] [varbinary](max) NOT NULL,
        [IsActive] [bit] NOT NULL,
        [CreatedAt] [datetime2](7) NOT NULL,
        CONSTRAINT [PK_AppUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- UserRoles (Many-to-Many: AppUsers <-> Roles)
IF OBJECT_ID(N'[dbo].[UserRoles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserRoles](
        [UserId] [int] NOT NULL,
        [RoleId] [int] NOT NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([UserId] ASC, [RoleId] ASC)
    );
END
GO

-- Departments
IF OBJECT_ID(N'[dbo].[Departments]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Departments](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](max) NOT NULL,
        [Description] [nvarchar](max) NOT NULL,
        [IsActive] [bit] NOT NULL,
        CONSTRAINT [PK_Departments] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- Teams
IF OBJECT_ID(N'[dbo].[Teams]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Teams](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](max) NOT NULL,
        [DepartmentId] [int] NOT NULL,
        [TeamHeadEmployeeId] [int] NULL,
        [IsActive] [bit] NOT NULL,
        CONSTRAINT [PK_Teams] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- Designations
IF OBJECT_ID(N'[dbo].[Designations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Designations](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](max) NOT NULL,
        [Description] [nvarchar](max) NOT NULL,
        [IsActive] [bit] NOT NULL,
        CONSTRAINT [PK_Designations] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- Employees
IF OBJECT_ID(N'[dbo].[Employees]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Employees](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [AppUserId] [int] NOT NULL,
        [Name] [nvarchar](max) NOT NULL,
        [Email] [nvarchar](max) NOT NULL,
        [DepartmentId] [int] NULL,
        [TeamId] [int] NULL,
        [SupervisorId] [int] NULL,
        [JoiningDate] [datetime2](7) NOT NULL,
        [IsActive] [bit] NOT NULL,
        CONSTRAINT [PK_Employees] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- EmployeeDesignations (Many-to-Many: Employees <-> Designations)
IF OBJECT_ID(N'[dbo].[EmployeeDesignations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[EmployeeDesignations](
        [EmployeeId] [int] NOT NULL,
        [DesignationId] [int] NOT NULL,
        CONSTRAINT [PK_EmployeeDesignations] PRIMARY KEY CLUSTERED ([EmployeeId] ASC, [DesignationId] ASC)
    );
END
GO

-- LeaveRequests
IF OBJECT_ID(N'[dbo].[LeaveRequests]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LeaveRequests](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [EmployeeId] [int] NOT NULL,
        [LeaveType] [nvarchar](max) NOT NULL,
        [Reason] [nvarchar](max) NOT NULL,
        [StartDate] [datetime2](7) NOT NULL,
        [EndDate] [datetime2](7) NOT NULL,
        [Status] [nvarchar](max) NOT NULL,
        [IsTeamLeave] [bit] NOT NULL,
        [TeamId] [int] NULL,
        [ApprovedBy] [int] NULL,
        [ApprovedDate] [datetime2](7) NULL,
        [CreatedAt] [datetime2](7) NOT NULL,
        CONSTRAINT [PK_LeaveRequests] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- ============================================================================
-- 3. Indexes & Constraints
-- ============================================================================

-- AppUsers Foreign Key on Employees
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Employees_AppUsers_AppUserId]'))
BEGIN
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_AppUsers_AppUserId]
    FOREIGN KEY([AppUserId]) REFERENCES [dbo].[AppUsers] ([Id]);
END
GO

-- UserRoles Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_UserRoles_AppUsers_UserId]'))
BEGIN
    ALTER TABLE [dbo].[UserRoles] WITH CHECK ADD CONSTRAINT [FK_UserRoles_AppUsers_UserId]
    FOREIGN KEY([UserId]) REFERENCES [dbo].[AppUsers] ([Id]) ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_UserRoles_Roles_RoleId]'))
BEGIN
    ALTER TABLE [dbo].[UserRoles] WITH CHECK ADD CONSTRAINT [FK_UserRoles_Roles_RoleId]
    FOREIGN KEY([RoleId]) REFERENCES [dbo].[Roles] ([Id]);
END
GO

-- Teams Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Teams_Departments_DepartmentId]'))
BEGIN
    ALTER TABLE [dbo].[Teams] WITH CHECK ADD CONSTRAINT [FK_Teams_Departments_DepartmentId]
    FOREIGN KEY([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Teams_Employees_TeamHeadEmployeeId]'))
BEGIN
    ALTER TABLE [dbo].[Teams] WITH CHECK ADD CONSTRAINT [FK_Teams_Employees_TeamHeadEmployeeId]
    FOREIGN KEY([TeamHeadEmployeeId]) REFERENCES [dbo].[Employees] ([Id]);
END
GO

-- Employees Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Employees_Departments_DepartmentId]'))
BEGIN
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Departments_DepartmentId]
    FOREIGN KEY([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Employees_Teams_TeamId]'))
BEGIN
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Teams_TeamId]
    FOREIGN KEY([TeamId]) REFERENCES [dbo].[Teams] ([Id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Employees_Employees_SupervisorId]'))
BEGIN
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Employees_SupervisorId]
    FOREIGN KEY([SupervisorId]) REFERENCES [dbo].[Employees] ([Id]);
END
GO

-- EmployeeDesignations Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_EmployeeDesignations_Employees_EmployeeId]'))
BEGIN
    ALTER TABLE [dbo].[EmployeeDesignations] WITH CHECK ADD CONSTRAINT [FK_EmployeeDesignations_Employees_EmployeeId]
    FOREIGN KEY([EmployeeId]) REFERENCES [dbo].[Employees] ([Id]) ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_EmployeeDesignations_Designations_DesignationId]'))
BEGIN
    ALTER TABLE [dbo].[EmployeeDesignations] WITH CHECK ADD CONSTRAINT [FK_EmployeeDesignations_Designations_DesignationId]
    FOREIGN KEY([DesignationId]) REFERENCES [dbo].[Designations] ([Id]);
END
GO

-- LeaveRequests Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_LeaveRequests_Employees_EmployeeId]'))
BEGIN
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Employees_EmployeeId]
    FOREIGN KEY([EmployeeId]) REFERENCES [dbo].[Employees] ([Id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_LeaveRequests_Teams_TeamId]'))
BEGIN
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Teams_TeamId]
    FOREIGN KEY([TeamId]) REFERENCES [dbo].[Teams] ([Id]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_LeaveRequests_Employees_ApprovedBy]'))
BEGIN
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Employees_ApprovedBy]
    FOREIGN KEY([ApprovedBy]) REFERENCES [dbo].[Employees] ([Id]);
END
GO

-- Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Employees_AppUserId' AND object_id = OBJECT_ID(N'[dbo].[Employees]'))
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Employees_AppUserId] ON [dbo].[Employees]([AppUserId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Employees_DepartmentId' AND object_id = OBJECT_ID(N'[dbo].[Employees]'))
    CREATE NONCLUSTERED INDEX [IX_Employees_DepartmentId] ON [dbo].[Employees]([DepartmentId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Employees_TeamId' AND object_id = OBJECT_ID(N'[dbo].[Employees]'))
    CREATE NONCLUSTERED INDEX [IX_Employees_TeamId] ON [dbo].[Employees]([TeamId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Employees_SupervisorId' AND object_id = OBJECT_ID(N'[dbo].[Employees]'))
    CREATE NONCLUSTERED INDEX [IX_Employees_SupervisorId] ON [dbo].[Employees]([SupervisorId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Teams_DepartmentId' AND object_id = OBJECT_ID(N'[dbo].[Teams]'))
    CREATE NONCLUSTERED INDEX [IX_Teams_DepartmentId] ON [dbo].[Teams]([DepartmentId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Teams_TeamHeadEmployeeId' AND object_id = OBJECT_ID(N'[dbo].[Teams]'))
    CREATE NONCLUSTERED INDEX [IX_Teams_TeamHeadEmployeeId] ON [dbo].[Teams]([TeamHeadEmployeeId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LeaveRequests_EmployeeId' AND object_id = OBJECT_ID(N'[dbo].[LeaveRequests]'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_EmployeeId] ON [dbo].[LeaveRequests]([EmployeeId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LeaveRequests_TeamId' AND object_id = OBJECT_ID(N'[dbo].[LeaveRequests]'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_TeamId] ON [dbo].[LeaveRequests]([TeamId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_LeaveRequests_ApprovedBy' AND object_id = OBJECT_ID(N'[dbo].[LeaveRequests]'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_ApprovedBy] ON [dbo].[LeaveRequests]([ApprovedBy] ASC);
GO

-- ============================================================================
-- 4. Seed Data
-- ============================================================================

-- Seed Migration History
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824090617_InitialCreate')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260824090617_InitialCreate', N'10.0.11');

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824091738_SeedRoles')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260824091738_SeedRoles', N'10.0.11');

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824103633_MakeEmployeeOrganizationOptional')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260824103633_MakeEmployeeOrganizationOptional', N'10.0.11');
GO

-- Seed Roles
SET IDENTITY_INSERT [dbo].[Roles] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 1)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) VALUES (1, N'Admin', N'Has full access to the system and can manage employees, roles, departments, teams and other settings.');
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 2)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) VALUES (2, N'HR', N'Can manage employees and handle employee leave requests but cannot assign roles.');
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 3)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) VALUES (3, N'Manager', N'Can manage their team and handle individual employee leave requests according to company policy.');
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 4)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) VALUES (4, N'Employee', N'Can view their information and submit their own leave requests.');
SET IDENTITY_INSERT [dbo].[Roles] OFF;
GO

-- Seed Departments
SET IDENTITY_INSERT [dbo].[Departments] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 1)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (1, N'IT', N'Information Technology Department', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 2)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (2, N'HR', N'Human Resources Department', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 3)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (3, N'Finance', N'Finance and Accounts Department', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 4)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (4, N'Sales', N'Sales and Business Development Department', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 5)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (5, N'Marketing', N'Marketing and Brand Management Department', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Departments] WHERE [Id] = 6)
    INSERT INTO [dbo].[Departments] ([Id], [Name], [Description], [IsActive]) VALUES (6, N'Customer Support', N'Customer Support and Service Department', 1);
SET IDENTITY_INSERT [dbo].[Departments] OFF;
GO

-- Seed Designations
SET IDENTITY_INSERT [dbo].[Designations] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 1)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (1, N'Software Developer', N'Develops and maintains software applications', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 2)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (2, N'Senior Software Developer', N'Develops complex applications and provides technical guidance', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 3)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (3, N'Backend Developer', N'Develops and maintains server-side applications and APIs', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 4)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (4, N'Frontend Developer', N'Develops and maintains user interfaces and frontend applications', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 5)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (5, N'QA Engineer', N'Tests software applications and identifies defects', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 6)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (6, N'HR Executive', N'Handles employee and human resource activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 7)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (7, N'HR Manager', N'Manages human resource operations and employee activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 8)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (8, N'Recruitment Specialist', N'Handles employee recruitment and hiring activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 9)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (9, N'Payroll Executive', N'Manages employee payroll and salary-related activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 10)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (10, N'Accountant', N'Handles accounting and financial records', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 11)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (11, N'Senior Accountant', N'Manages accounting operations and financial reporting', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 12)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (12, N'Financial Analyst', N'Analyzes financial data and prepares financial reports', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 13)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (13, N'Sales Executive', N'Handles sales activities and customer relationships', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 14)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (14, N'Senior Sales Executive', N'Manages sales activities and key customer accounts', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 15)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (15, N'Business Development Executive', N'Identifies new business opportunities and develops client relationships', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 16)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (16, N'Marketing Executive', N'Handles marketing campaigns and promotional activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 17)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (17, N'Digital Marketing Specialist', N'Manages digital marketing campaigns and online promotions', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 18)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (18, N'Social Media Executive', N'Manages social media platforms and social media campaigns', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 19)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (19, N'Content Strategist', N'Plans and manages marketing content strategies', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 20)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (20, N'Customer Support Executive', N'Handles customer queries and support requests', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 21)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (21, N'Technical Support Engineer', N'Provides technical assistance and resolves technical issues', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 22)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (22, N'Support Team Leader', N'Leads customer support operations and manages support staff', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 23)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (23, N'Team Leader', N'Leads and manages a team', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 24)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (24, N'Assistant Manager', N'Supports department management and operational activities', 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Designations] WHERE [Id] = 25)
    INSERT INTO [dbo].[Designations] ([Id], [Name], [Description], [IsActive]) VALUES (25, N'Department Manager', N'Manages department operations and employees', 1);
SET IDENTITY_INSERT [dbo].[Designations] OFF;
GO

-- Seed Teams
SET IDENTITY_INSERT [dbo].[Teams] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 1)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (1, N'Backend Team', 1, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 2)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (2, N'Frontend Team', 1, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 3)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (3, N'QA Team', 1, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 4)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (4, N'Recruitment Team', 2, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 5)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (5, N'Payroll Team', 2, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 6)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (6, N'Accounts Team', 3, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 7)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (7, N'Business Development Team', 4, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 8)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (8, N'Social Media Team', 5, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 9)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (9, N'Content Marketing Team', 5, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 10)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (10, N'Digital Marketing Team', 5, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 11)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (11, N'Customer Service Team', 6, NULL, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[Teams] WHERE [Id] = 12)
    INSERT INTO [dbo].[Teams] ([Id], [Name], [DepartmentId], [TeamHeadEmployeeId], [IsActive]) VALUES (12, N'Technical Support Team', 6, NULL, 1);
SET IDENTITY_INSERT [dbo].[Teams] OFF;
GO

-- Seed AppUsers
SET IDENTITY_INSERT [dbo].[AppUsers] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 1)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (1, N'Priyanka', N'priyankaaparmar0707@gmail.com', 0xEBEC0CF5F3F44B85A3883DB72F63138F435E500D1CF92ACCF413954968A8DB404929F512B75A8DCBC6DA45EBEA8DBC9EE03D99C3AF0295D2455A4EEF53A28CE1, 0x2475496C6BA37FAC8FAD3AC5010286F9AB5098A7FF93FC6747BA8F3C82A8AE48, 1, CAST(N'2026-08-26T06:36:58.8406762' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 3)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (3, N'parth', N'230130107078@gecg28.ac.in', 0x3D0068F17BE4C0F032579A80B92C869F652BD4C3755247C793C97F9B5D337728F119C4E69D6C062CC5936A4A8485E7D8EDE35D6B9BFAAC4D2B7261FD332F8077, 0xF772C222648ACDEE615AD0D00357633027116D0CAD6AC0F5549459B526B90D40, 1, CAST(N'2026-08-26T09:48:56.2022555' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 4)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (4, N'priya', N'priyankaaparmar1234@gmail.com', 0x6FA613BFD2F1B7F85008B8126A15C603A2D04D6E116CB7DE13EB1B0471B2B50AC7619EBED5E9B3393DC03C6D3C43B70971995C1799829AE24FBEF9AB3BC04615, 0x733FAE4A2F1786C19F1EACA8E614332B6E3100DFD44AFAF5834F83B581CC4FE6, 1, CAST(N'2026-08-26T10:19:16.5787874' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 5)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (5, N'pujan', N'pujan.gate@gmail.com', 0x955EF1E928689C84138B0422481FD7448231F956BC4192A222377BC59DC8A32183AB1B0C68C0187A24CF7FDD828749761A36DB59958C9D033D8FFD599D8D35E8, 0xEA9AB6882BF2E52D46889686E1DF148727949CDCC49AD0456364C051C20F5501, 1, CAST(N'2026-08-26T10:29:17.0581811' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 6)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (6, N'mansi', N'priyankaaparmar.cloud0707@gmail.com', 0xFDBFB2BC24F204E32FDCBEDD8495718E124450281862ACA89F82791D93C03904D55B44ECE34C883ADA9A5568BFAD1772FD8F9F0F9DD79D618EB5B07AA8B9A761, 0xA8E21B48DF9C839F455828978432A0334222207C3BD4A75A4CFE307C6C0B8514, 1, CAST(N'2026-08-26T10:37:05.9017113' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 7)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (7, N'khushi', N'priyankaaaaparmar0707@gmail.com', 0xE5CEB5A941FAD6CCEF4F5B218279C1F4D63128B24D426B82CC59DF8E4608AC02AD7DA03CC651915EB01C2F2826079A57C909FFC56719C054A07F94059D456900, 0x194A5E1AEFFBFA8FF4B61F5DE46CCFA45857DFF39660897F0100A0B343CBB818, 1, CAST(N'2026-08-26T10:43:49.9261871' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[AppUsers] WHERE [Id] = 8)
    INSERT INTO [dbo].[AppUsers] ([Id], [Username], [Email], [PasswordHash], [PasswordSalt], [IsActive], [CreatedAt])
    VALUES (8, N'riya', N'riyarathod0707@gmail.com', 0x881EF5A8ACDBF257B821C23CEA040F11126983B3EB33A2A73F8E8A0BB52EC29EBB4B4CA5D9FB3C068CDB617B6B1C1A28DFEF3FE151D0A2AD28EBC31CAF7B3AE5, 0xEAB630DA3C8D240F93A3C6F05E29FBB7245F8D89BA998E21C9E56C9EE353B642, 1, CAST(N'2026-08-26T10:51:26.0852488' AS DateTime2));
SET IDENTITY_INSERT [dbo].[AppUsers] OFF;
GO

-- Seed Employees
SET IDENTITY_INSERT [dbo].[Employees] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 1)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (1, 1, N'system admin', N'priyankaaparmar0707@gmail.com', NULL, NULL, NULL, CAST(N'2026-08-26T06:36:59.0561554' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 3)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (3, 3, N'parth patel', N'230130107078@gecg28.ac.in', 2, 4, 1, CAST(N'2026-08-26T09:48:56.3966512' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 4)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (4, 4, N'priya parmar', N'priyankaaparmar1234@gmail.com', 2, 5, 4, CAST(N'2026-08-26T10:19:16.5867556' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 5)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (5, 5, N'pujan dave', N'pujan.gate@gmail.com', 1, 1, 4, CAST(N'2026-08-26T10:29:17.0622760' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 6)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (6, 6, N'mansi chauhan', N'priyankaaparmar.cloud0707@gmail.com', 6, 11, 5, CAST(N'2026-08-26T10:37:05.9059183' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 7)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (7, 7, N'khushi bhimani', N'priyankaaaaparmar0707@gmail.com', 1, 1, 5, CAST(N'2026-08-26T10:43:49.9319118' AS DateTime2), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Employees] WHERE [Id] = 8)
    INSERT INTO [dbo].[Employees] ([Id], [AppUserId], [Name], [Email], [DepartmentId], [TeamId], [SupervisorId], [JoiningDate], [IsActive])
    VALUES (8, 8, N'riya maru', N'riyarathod0707@gmail.com', 6, 11, 1, CAST(N'2026-08-26T10:51:26.0890493' AS DateTime2), 1);
SET IDENTITY_INSERT [dbo].[Employees] OFF;
GO

-- Seed EmployeeDesignations
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 5 AND [DesignationId] = 2)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (5, 2);
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 7 AND [DesignationId] = 3)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (7, 3);
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 3 AND [DesignationId] = 8)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (3, 8);
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 4 AND [DesignationId] = 9)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (4, 9);
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 8 AND [DesignationId] = 20)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (8, 20);
IF NOT EXISTS (SELECT 1 FROM [dbo].[EmployeeDesignations] WHERE [EmployeeId] = 6 AND [DesignationId] = 22)
    INSERT INTO [dbo].[EmployeeDesignations] ([EmployeeId], [DesignationId]) VALUES (6, 22);
GO

-- Seed UserRoles
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 1 AND [RoleId] = 1)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (1, 1);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 3 AND [RoleId] = 2)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (3, 2);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 4 AND [RoleId] = 2)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (4, 2);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 5 AND [RoleId] = 4)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (5, 4);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 6 AND [RoleId] = 4)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (6, 4);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 7 AND [RoleId] = 4)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (7, 4);
IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE [UserId] = 8 AND [RoleId] = 4)
    INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (8, 4);
GO

-- Seed LeaveRequests
SET IDENTITY_INSERT [dbo].[LeaveRequests] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[LeaveRequests] WHERE [Id] = 1)
    INSERT INTO [dbo].[LeaveRequests] ([Id], [EmployeeId], [LeaveType], [Reason], [StartDate], [EndDate], [Status], [IsTeamLeave], [TeamId], [ApprovedBy], [ApprovedDate], [CreatedAt])
    VALUES (1, 5, N'Casual Leave', N'Personal work', CAST(N'2026-08-28T00:00:00.0000000' AS DateTime2), CAST(N'2026-08-29T00:00:00.0000000' AS DateTime2), N'Approved', 0, NULL, 3, CAST(N'2026-08-26T12:52:32.3920452' AS DateTime2), CAST(N'2026-08-26T12:45:44.4020292' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[LeaveRequests] WHERE [Id] = 2)
    INSERT INTO [dbo].[LeaveRequests] ([Id], [EmployeeId], [LeaveType], [Reason], [StartDate], [EndDate], [Status], [IsTeamLeave], [TeamId], [ApprovedBy], [ApprovedDate], [CreatedAt])
    VALUES (2, 8, N'Sick Leave', N'Not feeling well', CAST(N'2026-09-02T00:00:00.0000000' AS DateTime2), CAST(N'2026-09-03T00:00:00.0000000' AS DateTime2), N'Approved', 0, NULL, 3, CAST(N'2026-08-26T13:04:08.7874876' AS DateTime2), CAST(N'2026-08-26T13:02:18.5124204' AS DateTime2));

IF NOT EXISTS (SELECT 1 FROM [dbo].[LeaveRequests] WHERE [Id] = 3)
    INSERT INTO [dbo].[LeaveRequests] ([Id], [EmployeeId], [LeaveType], [Reason], [StartDate], [EndDate], [Status], [IsTeamLeave], [TeamId], [ApprovedBy], [ApprovedDate], [CreatedAt])
    VALUES (3, 6, N'Casual Leave', N'Personal work', CAST(N'2026-09-03T00:00:00.0000000' AS DateTime2), CAST(N'2026-09-04T00:00:00.0000000' AS DateTime2), N'Cancelled', 0, NULL, NULL, NULL, CAST(N'2026-09-01T07:37:10.4555169' AS DateTime2));
SET IDENTITY_INSERT [dbo].[LeaveRequests] OFF;
GO
