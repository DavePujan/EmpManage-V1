using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Employee;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public EmployeeRepository(
        AppDbContext context,
        IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<bool> CreateEmployeeAsync(
        CreateEmployeeDto dto,
        string temporaryPassword)
    {
        // Check whether username already exists
        var usernameExists = await _context.AppUsers
            .AnyAsync(u => u.Username == dto.Username);

        if (usernameExists)
        {
            return false;
        }

        // Check whether email already exists
        var emailExists = await _context.AppUsers
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            return false;
        }

        // Check whether role exists
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == dto.RoleId);

        if (role == null)
        {
            return false;
        }

        // Check whether designation exists
        var designation = await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == dto.DesignationId);

        if (designation == null)
        {
            return false;
        }

        // Check whether department exists
        if (dto.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Departments
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);

            if (!departmentExists)
            {
                return false;
            }
        }

        // Check whether team exists
        if (dto.TeamId.HasValue)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId.Value);

            if (team == null)
            {
                return false;
            }

            // If department is selected,
            // make sure the team belongs to that department.
            if (dto.DepartmentId.HasValue &&
                team.DepartmentId != dto.DepartmentId.Value)
            {
                return false;
            }
        }

        // Create password hash and salt
        _passwordService.CreatePasswordHash(
            temporaryPassword,
            out byte[] passwordHash,
            out byte[] passwordSalt);

        // Create AppUser
        var appUser = new AppUser
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            IsActive = true
        };

        _context.AppUsers.Add(appUser);

        await _context.SaveChangesAsync();

        // Create Employee
        var employee = new Employee
        {
            AppUserId = appUser.Id,
            Name = dto.Name,
            Email = dto.Email,
            DepartmentId = dto.DepartmentId,
            TeamId = dto.TeamId,
            SupervisorId = dto.SupervisorId,
            JoiningDate = DateTime.UtcNow,
            IsActive = true
        };

        _context.Employees.Add(employee);

        await _context.SaveChangesAsync();

        // Assign designation to employee
        var employeeDesignation = new EmployeeDesignation
        {
            EmployeeId = employee.Id,
            DesignationId = dto.DesignationId
        };

        _context.EmployeeDesignations.Add(employeeDesignation);

        // Assign role
        var userRole = new UserRole
        {
            UserId = appUser.Id,
            RoleId = dto.RoleId
        };

        _context.UserRoles.Add(userRole);

        await _context.SaveChangesAsync();

        return true;
    }
    public async Task<List<EmployeeListDto>> GetAllEmployeesAsync()
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.Supervisor)
            .Include(e => e.EmployeeDesignations)
                .ThenInclude(ed => ed.Designation)
            .Select(e => new EmployeeListDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,

                Department = e.Department != null
                    ? e.Department.Name
                    : "",

                Team = e.Team != null
                    ? e.Team.Name
                    : "",

                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",

                Supervisor = e.Supervisor != null
                    ? e.Supervisor.Name
                    : "",

                IsActive = e.IsActive
            })
            .ToListAsync();
    }
}