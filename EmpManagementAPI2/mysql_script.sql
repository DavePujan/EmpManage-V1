-- ============================================================================
-- MySQL Database Script for Employee Management API (EmpManagement2DB)
-- Fully compatible with MySQL Workbench, phpMyAdmin, and MySQL 8.0+
-- ============================================================================

-- 1. Create and Use Database
CREATE DATABASE IF NOT EXISTS `EmpManagement2DB`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `EmpManagement2DB`;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS `Roles` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(100) NOT NULL,
    `Description` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `AppUsers` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Username` VARCHAR(150) NOT NULL UNIQUE,
    `Email` VARCHAR(150) NOT NULL UNIQUE,
    `PasswordHash` LONGBLOB NOT NULL,
    `PasswordSalt` LONGBLOB NOT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `UserRoles` (
    `UserId` INT NOT NULL,
    `RoleId` INT NOT NULL,
    PRIMARY KEY (`UserId`, `RoleId`),
    CONSTRAINT `FK_UserRoles_AppUsers` FOREIGN KEY (`UserId`) REFERENCES `AppUsers` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserRoles_Roles` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Departments` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(150) NOT NULL,
    `Description` TEXT NOT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Teams` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(150) NOT NULL,
    `DepartmentId` INT NOT NULL,
    `TeamHeadEmployeeId` INT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT `FK_Teams_Departments` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Designations` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(150) NOT NULL,
    `Description` TEXT NOT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Employees` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `AppUserId` INT NOT NULL UNIQUE,
    `Name` VARCHAR(150) NOT NULL,
    `Email` VARCHAR(150) NOT NULL,
    `DepartmentId` INT NULL,
    `TeamId` INT NULL,
    `SupervisorId` INT NULL,
    `JoiningDate` DATETIME(6) NOT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT `FK_Employees_AppUsers` FOREIGN KEY (`AppUserId`) REFERENCES `AppUsers` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Employees_Departments` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Employees_Teams` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Employees_Supervisor` FOREIGN KEY (`SupervisorId`) REFERENCES `Employees` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add Foreign Key for Teams.TeamHeadEmployeeId referencing Employees
ALTER TABLE `Teams`
ADD CONSTRAINT `FK_Teams_Employees_TeamHead`
FOREIGN KEY IF NOT EXISTS (`TeamHeadEmployeeId`) REFERENCES `Employees` (`Id`) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS `EmployeeDesignations` (
    `EmployeeId` INT NOT NULL,
    `DesignationId` INT NOT NULL,
    PRIMARY KEY (`EmployeeId`, `DesignationId`),
    CONSTRAINT `FK_EmployeeDesignations_Employees` FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_EmployeeDesignations_Designations` FOREIGN KEY (`DesignationId`) REFERENCES `Designations` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `LeaveRequests` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `EmployeeId` INT NOT NULL,
    `LeaveType` VARCHAR(100) NOT NULL,
    `Reason` TEXT NOT NULL,
    `StartDate` DATETIME(6) NOT NULL,
    `EndDate` DATETIME(6) NOT NULL,
    `Status` VARCHAR(50) NOT NULL,
    `IsTeamLeave` TINYINT(1) NOT NULL DEFAULT 0,
    `TeamId` INT NULL,
    `ApprovedBy` INT NULL,
    `ApprovedDate` DATETIME(6) NULL,
    `CreatedAt` DATETIME(6) NOT NULL,
    CONSTRAINT `FK_LeaveRequests_Employees` FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_LeaveRequests_Teams` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_LeaveRequests_ApprovedBy` FOREIGN KEY (`ApprovedBy`) REFERENCES `Employees` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Seed Default System Roles
INSERT IGNORE INTO `Roles` (`Id`, `Name`, `Description`) VALUES
(1, 'Admin', 'Has full access to the system and can manage employees, roles, departments, teams and other settings.'),
(2, 'HR', 'Can manage employees and handle employee leave requests but cannot assign roles.'),
(3, 'Manager', 'Can manage their team and handle individual employee leave requests according to company policy.'),
(4, 'Employee', 'Can view their information and submit their own leave requests.');
