-- ============================================================================
-- Database Script for Employee Management API (EmpManagement2DB)
-- Portable SQL Server Script with Schema, Constraints, Indexes & Seed Data
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
-- 3. Create Indexes
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRoles_RoleId' AND object_id = OBJECT_ID('dbo.UserRoles'))
    CREATE NONCLUSTERED INDEX [IX_UserRoles_RoleId] ON [dbo].[UserRoles] ([RoleId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Teams_DepartmentId' AND object_id = OBJECT_ID('dbo.Teams'))
    CREATE NONCLUSTERED INDEX [IX_Teams_DepartmentId] ON [dbo].[Teams] ([DepartmentId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Teams_TeamHeadEmployeeId' AND object_id = OBJECT_ID('dbo.Teams'))
    CREATE NONCLUSTERED INDEX [IX_Teams_TeamHeadEmployeeId] ON [dbo].[Teams] ([TeamHeadEmployeeId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employees_AppUserId' AND object_id = OBJECT_ID('dbo.Employees'))
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Employees_AppUserId] ON [dbo].[Employees] ([AppUserId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employees_DepartmentId' AND object_id = OBJECT_ID('dbo.Employees'))
    CREATE NONCLUSTERED INDEX [IX_Employees_DepartmentId] ON [dbo].[Employees] ([DepartmentId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employees_SupervisorId' AND object_id = OBJECT_ID('dbo.Employees'))
    CREATE NONCLUSTERED INDEX [IX_Employees_SupervisorId] ON [dbo].[Employees] ([SupervisorId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Employees_TeamId' AND object_id = OBJECT_ID('dbo.Employees'))
    CREATE NONCLUSTERED INDEX [IX_Employees_TeamId] ON [dbo].[Employees] ([TeamId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EmployeeDesignations_DesignationId' AND object_id = OBJECT_ID('dbo.EmployeeDesignations'))
    CREATE NONCLUSTERED INDEX [IX_EmployeeDesignations_DesignationId] ON [dbo].[EmployeeDesignations] ([DesignationId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LeaveRequests_ApprovedBy' AND object_id = OBJECT_ID('dbo.LeaveRequests'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_ApprovedBy] ON [dbo].[LeaveRequests] ([ApprovedBy] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LeaveRequests_EmployeeId' AND object_id = OBJECT_ID('dbo.LeaveRequests'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_EmployeeId] ON [dbo].[LeaveRequests] ([EmployeeId] ASC);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LeaveRequests_TeamId' AND object_id = OBJECT_ID('dbo.LeaveRequests'))
    CREATE NONCLUSTERED INDEX [IX_LeaveRequests_TeamId] ON [dbo].[LeaveRequests] ([TeamId] ASC);
GO

-- ============================================================================
-- 4. Foreign Key Constraints
-- ============================================================================

-- UserRoles -> AppUsers & Roles
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_AppUsers_UserId')
    ALTER TABLE [dbo].[UserRoles] WITH CHECK ADD CONSTRAINT [FK_UserRoles_AppUsers_UserId] 
    FOREIGN KEY([UserId]) REFERENCES [dbo].[AppUsers] ([Id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_Roles_RoleId')
    ALTER TABLE [dbo].[UserRoles] WITH CHECK ADD CONSTRAINT [FK_UserRoles_Roles_RoleId] 
    FOREIGN KEY([RoleId]) REFERENCES [dbo].[Roles] ([Id]);
GO

-- Teams -> Departments & Employees (Team Head)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Teams_Departments_DepartmentId')
    ALTER TABLE [dbo].[Teams] WITH CHECK ADD CONSTRAINT [FK_Teams_Departments_DepartmentId] 
    FOREIGN KEY([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Teams_Employees_TeamHeadEmployeeId')
    ALTER TABLE [dbo].[Teams] WITH CHECK ADD CONSTRAINT [FK_Teams_Employees_TeamHeadEmployeeId] 
    FOREIGN KEY([TeamHeadEmployeeId]) REFERENCES [dbo].[Employees] ([Id]);
GO

-- Employees -> AppUsers, Departments, Teams, Supervisors
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Employees_AppUsers_AppUserId')
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_AppUsers_AppUserId] 
    FOREIGN KEY([AppUserId]) REFERENCES [dbo].[AppUsers] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Employees_Departments_DepartmentId')
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Departments_DepartmentId] 
    FOREIGN KEY([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Employees_Teams_TeamId')
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Teams_TeamId] 
    FOREIGN KEY([TeamId]) REFERENCES [dbo].[Teams] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Employees_Employees_SupervisorId')
    ALTER TABLE [dbo].[Employees] WITH CHECK ADD CONSTRAINT [FK_Employees_Employees_SupervisorId] 
    FOREIGN KEY([SupervisorId]) REFERENCES [dbo].[Employees] ([Id]);
GO

-- EmployeeDesignations -> Employees & Designations
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EmployeeDesignations_Employees_EmployeeId')
    ALTER TABLE [dbo].[EmployeeDesignations] WITH CHECK ADD CONSTRAINT [FK_EmployeeDesignations_Employees_EmployeeId] 
    FOREIGN KEY([EmployeeId]) REFERENCES [dbo].[Employees] ([Id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EmployeeDesignations_Designations_DesignationId')
    ALTER TABLE [dbo].[EmployeeDesignations] WITH CHECK ADD CONSTRAINT [FK_EmployeeDesignations_Designations_DesignationId] 
    FOREIGN KEY([DesignationId]) REFERENCES [dbo].[Designations] ([Id]);
GO

-- LeaveRequests -> Employees, Teams, ApprovedBy
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LeaveRequests_Employees_EmployeeId')
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Employees_EmployeeId] 
    FOREIGN KEY([EmployeeId]) REFERENCES [dbo].[Employees] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LeaveRequests_Teams_TeamId')
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Teams_TeamId] 
    FOREIGN KEY([TeamId]) REFERENCES [dbo].[Teams] ([Id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LeaveRequests_Employees_ApprovedBy')
    ALTER TABLE [dbo].[LeaveRequests] WITH CHECK ADD CONSTRAINT [FK_LeaveRequests_Employees_ApprovedBy] 
    FOREIGN KEY([ApprovedBy]) REFERENCES [dbo].[Employees] ([Id]);
GO

-- ============================================================================
-- 5. Seed Required System Roles
-- ============================================================================

SET IDENTITY_INSERT [dbo].[Roles] ON;
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 1)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) 
    VALUES (1, N'Admin', N'Has full access to the system and can manage employees, roles, departments, teams and other settings.');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 2)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) 
    VALUES (2, N'HR', N'Can manage employees and handle employee leave requests but cannot assign roles.');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 3)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) 
    VALUES (3, N'Manager', N'Can manage their team and handle individual employee leave requests according to company policy.');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = 4)
    INSERT INTO [dbo].[Roles] ([Id], [Name], [Description]) 
    VALUES (4, N'Employee', N'Can view their information and submit their own leave requests.');

SET IDENTITY_INSERT [dbo].[Roles] OFF;
GO

-- ============================================================================
-- 6. EF Core Migrations History Entries
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824090617_InitialCreate')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260824090617_InitialCreate', N'8.0.11');

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824091738_SeedRoles')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260824091738_SeedRoles', N'8.0.11');

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260824103633_MakeEmployeeOrganizationOptional')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260824103633_MakeEmployeeOrganizationOptional', N'8.0.11');
GO

PRINT 'EmpManagement2DB setup script executed successfully.';
GO
