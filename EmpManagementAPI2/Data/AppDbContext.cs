using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Designation> Designations { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeDesignation> EmployeeDesignations { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // AppUser → Employee
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.AppUser)
            .WithOne(u => u.Employee)
            .HasForeignKey<Employee>(e => e.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // UserRole composite key
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        // UserRole → AppUser
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany()
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserRole → Role
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany()
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Department → Teams
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Department)
            .WithMany(d => d.Teams)
            .HasForeignKey(t => t.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Team → Team Head
        modelBuilder.Entity<Team>()
            .HasOne(t => t.TeamHeadEmployee)
            .WithMany()
            .HasForeignKey(t => t.TeamHeadEmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Department → Employees
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Team → Employees
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Team)
            .WithMany(t => t.Employees)
            .HasForeignKey(e => e.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Employee → Supervisor
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Supervisor)
            .WithMany(e => e.Subordinates)
            .HasForeignKey(e => e.SupervisorId)
            .OnDelete(DeleteBehavior.Restrict);

        // EmployeeDesignation composite key
        modelBuilder.Entity<EmployeeDesignation>()
            .HasKey(ed => new { ed.EmployeeId, ed.DesignationId });

        // EmployeeDesignation → Employee
        modelBuilder.Entity<EmployeeDesignation>()
            .HasOne(ed => ed.Employee)
            .WithMany(e => e.EmployeeDesignations)
            .HasForeignKey(ed => ed.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // EmployeeDesignation → Designation
        modelBuilder.Entity<EmployeeDesignation>()
            .HasOne(ed => ed.Designation)
            .WithMany(d => d.EmployeeDesignations)
            .HasForeignKey(ed => ed.DesignationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Employee → Leave Requests
        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Employee)
            .WithMany(e => e.LeaveRequests)
            .HasForeignKey(lr => lr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Team → Leave Requests
        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Team)
            .WithMany()
            .HasForeignKey(lr => lr.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Leave Request → Approved By Employee
        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.ApprovedByEmployee)
            .WithMany()
            .HasForeignKey(lr => lr.ApprovedBy)
            .OnDelete(DeleteBehavior.Restrict);

        //seedroles

        modelBuilder.Entity<Role>().HasData(
    new Role
    {
        Id = 1,
        Name = "Admin",
        Description = "Has full access to the system and can manage employees, roles, departments, teams and other settings."
    },
    new Role
    {
        Id = 2,
        Name = "HR",
        Description = "Can manage employees and handle employee leave requests but cannot assign roles."
    },
    new Role
    {
        Id = 3,
        Name = "Manager",
        Description = "Can manage their team and handle individual employee leave requests according to company policy."
    },
    new Role
    {
        Id = 4,
        Name = "Employee",
        Description = "Can view their information and submit their own leave requests."
    }
);
    }
}