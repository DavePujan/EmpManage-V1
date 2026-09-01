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

    // CREATE EMPLOYEE
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

    // GET ALL EMPLOYEES
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

    // GET EMPLOYEE BY ID
    public async Task<EmployeeListDto?> GetEmployeeByIdAsync(int id)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.Supervisor)
            .Include(e => e.EmployeeDesignations)
                .ThenInclude(ed => ed.Designation)
            .Where(e => e.Id == id)
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
            .FirstOrDefaultAsync();
    }

    // UPDATE EMPLOYEE
    public async Task<bool> UpdateEmployeeAsync(
        int id,
        UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return false;
        }

        // Check whether email is already used by another user
        var emailExists = await _context.AppUsers
            .AnyAsync(u =>
                u.Email == dto.Email &&
                u.Id != employee.AppUserId);

        if (emailExists)
        {
            return false;
        }

        // Check department
        if (dto.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Departments
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);

            if (!departmentExists)
            {
                return false;
            }
        }

        // Check team
        if (dto.TeamId.HasValue)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId.Value);

            if (team == null)
            {
                return false;
            }

            // Make sure team belongs to selected department
            if (dto.DepartmentId.HasValue &&
                team.DepartmentId != dto.DepartmentId.Value)
            {
                return false;
            }
        }

        // Check designation
        var designationExists = await _context.Designations
            .AnyAsync(d => d.Id == dto.DesignationId);

        if (!designationExists)
        {
            return false;
        }

        // Update Employee
        employee.Name = dto.Name;
        employee.Email = dto.Email;
        employee.DepartmentId = dto.DepartmentId;
        employee.TeamId = dto.TeamId;
        employee.SupervisorId = dto.SupervisorId;

        // Update AppUser email
        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == employee.AppUserId);

        if (appUser != null)
        {
            appUser.Email = dto.Email;
        }

        // Update designation
        var employeeDesignation = await _context.EmployeeDesignations
            .FirstOrDefaultAsync(ed => ed.EmployeeId == employee.Id);

        if (employeeDesignation != null)
        {
            employeeDesignation.DesignationId = dto.DesignationId;
        }

        await _context.SaveChangesAsync();

        return true;
    }

    // DELETE EMPLOYEE
    public async Task<bool> DeleteEmployeeAsync(int id)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return false;
        }

        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == employee.AppUserId);

        var employeeDesignation = await _context.EmployeeDesignations
            .Where(ed => ed.EmployeeId == employee.Id)
            .ToListAsync();

        _context.EmployeeDesignations.RemoveRange(employeeDesignation);

        _context.Employees.Remove(employee);

        if (appUser != null)
        {
            _context.AppUsers.Remove(appUser);
        }

        await _context.SaveChangesAsync();

        return true;
    }

    // GET EMPLOYEE COUNT
    public async Task<int> GetEmployeeCountAsync()
    {
        return await _context.Employees
            .CountAsync(e => e.IsActive);
    }

    // UPDATE EMPLOYEE STATUS
    public async Task<bool> UpdateEmployeeStatusAsync(
        int id,
        UpdateEmployeeStatusDto dto)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return false;
        }

        employee.IsActive = dto.IsActive;

        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == employee.AppUserId);

        if (appUser != null)
        {
            appUser.IsActive = dto.IsActive;
        }

        await _context.SaveChangesAsync();

        return true;

    }
    public async Task<EmployeeListDto?> GetMyProfileAsync(int userId)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.Supervisor)
            .Include(e => e.EmployeeDesignations)
                .ThenInclude(ed => ed.Designation)
            .Where(e => e.AppUserId == userId)
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
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateMyProfileAsync(
    int userId,
    UpdateMyProfileDto dto)
    {
        // Find the employee using the logged-in user's ID
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.AppUserId == userId);

        if (employee == null)
        {
            return false;
        }

        // Check whether another user already has this email
        var emailExists = await _context.AppUsers
            .AnyAsync(u =>
                u.Email == dto.Email &&
                u.Id != userId);

        if (emailExists)
        {
            return false;
        }

        // Find the related AppUser
        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (appUser == null)
        {
            return false;
        }

        // Update employee information
        employee.Name = dto.Name;
        employee.Email = dto.Email;

        // Keep AppUser email synchronized
        appUser.Email = dto.Email;

        await _context.SaveChangesAsync();

        return true;
    }
}