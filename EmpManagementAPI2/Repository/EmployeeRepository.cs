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
        var usernameExists = await _context.AppUsers
            .AnyAsync(u => u.Username == dto.Username);

        if (usernameExists)
        {
            return false;
        }

        var emailExists = await _context.AppUsers
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            return false;
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == dto.RoleId);

        if (role == null)
        {
            return false;
        }

        var designation = await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == dto.DesignationId);

        if (designation == null)
        {
            return false;
        }

        if (dto.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Departments
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);

            if (!departmentExists)
            {
                return false;
            }
        }

        if (dto.TeamId.HasValue)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId.Value);

            if (team == null)
            {
                return false;
            }

            if (dto.DepartmentId.HasValue &&
                team.DepartmentId != dto.DepartmentId.Value)
            {
                return false;
            }
        }

        _passwordService.CreatePasswordHash(
            temporaryPassword,
            out byte[] passwordHash,
            out byte[] passwordSalt);

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

        var employeeDesignation = new EmployeeDesignation
        {
            EmployeeId = employee.Id,
            DesignationId = dto.DesignationId
        };

        _context.EmployeeDesignations.Add(employeeDesignation);

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
            .AsNoTracking()
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
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",
                Supervisor = e.Supervisor != null ? e.Supervisor.Name : "",
                IsActive = e.IsActive
            })
            .ToListAsync();
    }

    // SEARCH / FILTERED PAGINATED EMPLOYEES
    public async Task<EmployeePagedResultDto> SearchEmployeesAsync(EmployeeFilterDto filter)
    {
        var query = _context.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.Supervisor)
            .Include(e => e.EmployeeDesignations)
                .ThenInclude(ed => ed.Designation)
            .AsQueryable();

        // Search text
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(e => e.Name.ToLower().Contains(search) || e.Email.ToLower().Contains(search));
        }

        // Status
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            if (string.Equals(filter.Status, "Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(e => e.IsActive);
            }
            else if (string.Equals(filter.Status, "Inactive", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(e => !e.IsActive);
            }
        }

        // Department
        if (filter.DepartmentId.HasValue && filter.DepartmentId.Value > 0)
        {
            query = query.Where(e => e.DepartmentId == filter.DepartmentId.Value);
        }

        // Team
        if (filter.TeamId.HasValue && filter.TeamId.Value > 0)
        {
            query = query.Where(e => e.TeamId == filter.TeamId.Value);
        }

        // Designation
        if (filter.DesignationId.HasValue && filter.DesignationId.Value > 0)
        {
            query = query.Where(e => e.EmployeeDesignations.Any(ed => ed.DesignationId == filter.DesignationId.Value));
        }

        // Supervisor
        if (filter.SupervisorId.HasValue && filter.SupervisorId.Value > 0)
        {
            query = query.Where(e => e.SupervisorId == filter.SupervisorId.Value);
        }

        var totalRecords = await query.CountAsync();

        // Sorting
        query = (filter.SortBy?.ToLower()) switch
        {
            "email" => filter.SortDescending ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "department" => filter.SortDescending ? query.OrderByDescending(e => e.Department != null ? e.Department.Name : "") : query.OrderBy(e => e.Department != null ? e.Department.Name : ""),
            "team" => filter.SortDescending ? query.OrderByDescending(e => e.Team != null ? e.Team.Name : "") : query.OrderBy(e => e.Team != null ? e.Team.Name : ""),
            _ => filter.SortDescending ? query.OrderByDescending(e => e.Name) : query.OrderBy(e => e.Name)
        };

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Max(1, filter.PageSize);

        var employees = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EmployeeListDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",
                Supervisor = e.Supervisor != null ? e.Supervisor.Name : "",
                IsActive = e.IsActive
            })
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

        return new EmployeePagedResultDto
        {
            Employees = employees,
            Page = page,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            TotalPages = totalPages
        };
    }

    // GET EMPLOYEE BY ID
    public async Task<EmployeeListDto?> GetEmployeeByIdAsync(int id)
    {
        return await _context.Employees
            .AsNoTracking()
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
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",
                Supervisor = e.Supervisor != null ? e.Supervisor.Name : "",
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

        var emailExists = await _context.AppUsers
            .AnyAsync(u =>
                u.Email == dto.Email &&
                u.Id != employee.AppUserId);

        if (emailExists)
        {
            return false;
        }

        var designation = await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == dto.DesignationId);

        if (designation == null)
        {
            return false;
        }

        if (dto.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Departments
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);

            if (!departmentExists)
            {
                return false;
            }
        }

        if (dto.TeamId.HasValue)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == dto.TeamId.Value);

            if (team == null)
            {
                return false;
            }

            if (dto.DepartmentId.HasValue &&
                team.DepartmentId != dto.DepartmentId.Value)
            {
                return false;
            }
        }

        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == employee.AppUserId);

        if (appUser == null)
        {
            return false;
        }

        employee.Name = dto.Name;
        employee.Email = dto.Email;
        employee.DepartmentId = dto.DepartmentId;
        employee.TeamId = dto.TeamId;
        employee.SupervisorId = dto.SupervisorId;

        appUser.Email = dto.Email;

        var existingDesignations = await _context.EmployeeDesignations
            .Where(ed => ed.EmployeeId == id)
            .ToListAsync();

        _context.EmployeeDesignations.RemoveRange(existingDesignations);

        var newDesignation = new EmployeeDesignation
        {
            EmployeeId = id,
            DesignationId = dto.DesignationId
        };

        _context.EmployeeDesignations.Add(newDesignation);

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

        if (appUser == null)
        {
            return false;
        }

        // Remove employee's designations
        var employeeDesignations = await _context.EmployeeDesignations
            .Where(ed => ed.EmployeeId == id)
            .ToListAsync();

        _context.EmployeeDesignations.RemoveRange(employeeDesignations);

        // Remove employee's user roles
        var userRoles = await _context.UserRoles
            .Where(ur => ur.UserId == appUser.Id)
            .ToListAsync();

        _context.UserRoles.RemoveRange(userRoles);

        _context.Employees.Remove(employee);
        _context.AppUsers.Remove(appUser);

        await _context.SaveChangesAsync();
        return true;
    }

    // GET EMPLOYEE COUNT
    public async Task<int> GetEmployeeCountAsync()
    {
        return await _context.Employees.CountAsync();
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

        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == employee.AppUserId);

        if (appUser == null)
        {
            return false;
        }

        employee.IsActive = dto.IsActive;
        appUser.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return true;
    }

    // GET MY PROFILE
    public async Task<EmployeeListDto?> GetMyProfileAsync(int userId)
    {
        return await _context.Employees
            .AsNoTracking()
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
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",
                Supervisor = e.Supervisor != null ? e.Supervisor.Name : "",
                IsActive = e.IsActive
            })
            .FirstOrDefaultAsync();
    }

    // UPDATE MY PROFILE
    public async Task<bool> UpdateMyProfileAsync(
        int userId,
        UpdateMyProfileDto dto)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.AppUserId == userId);

        if (employee == null)
        {
            return false;
        }

        var emailExists = await _context.AppUsers
            .AnyAsync(u => u.Email == dto.Email && u.Id != userId);

        if (emailExists)
        {
            return false;
        }

        var appUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (appUser == null)
        {
            return false;
        }

        employee.Name = dto.Name;
        employee.Email = dto.Email;
        appUser.Email = dto.Email;

        await _context.SaveChangesAsync();
        return true;
    }

    // UPDATE EMPLOYEE DEPARTMENT
    public async Task<bool> UpdateEmployeeDepartmentAsync(int id, UpdateEmployeeDepartmentDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        if (dto.DepartmentId.HasValue)
        {
            var exists = await _context.Departments.AnyAsync(d => d.Id == dto.DepartmentId.Value);
            if (!exists) return false;
        }

        employee.DepartmentId = dto.DepartmentId;
        // If team assigned does not belong to new department, clear it
        if (employee.TeamId.HasValue && dto.DepartmentId.HasValue)
        {
            var teamMatches = await _context.Teams.AnyAsync(t => t.Id == employee.TeamId.Value && t.DepartmentId == dto.DepartmentId.Value);
            if (!teamMatches) employee.TeamId = null;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // UPDATE EMPLOYEE TEAM
    public async Task<bool> UpdateEmployeeTeamAsync(int id, UpdateEmployeeTeamDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        if (dto.TeamId.HasValue)
        {
            var team = await _context.Teams.FindAsync(dto.TeamId.Value);
            if (team == null) return false;

            if (employee.DepartmentId.HasValue && team.DepartmentId != employee.DepartmentId.Value)
            {
                return false;
            }
        }

        employee.TeamId = dto.TeamId;
        await _context.SaveChangesAsync();
        return true;
    }

    // UPDATE EMPLOYEE SUPERVISOR
    public async Task<bool> UpdateEmployeeSupervisorAsync(int id, UpdateEmployeeSupervisorDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        if (dto.SupervisorId.HasValue)
        {
            if (dto.SupervisorId.Value == id) return false; // Prevent self supervision

            var exists = await _context.Employees.AnyAsync(e => e.Id == dto.SupervisorId.Value);
            if (!exists) return false;
        }

        employee.SupervisorId = dto.SupervisorId;
        await _context.SaveChangesAsync();
        return true;
    }

    // UPDATE EMPLOYEE DESIGNATION
    public async Task<bool> UpdateEmployeeDesignationAsync(int id, UpdateEmployeeDesignationDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        var desigExists = await _context.Designations.AnyAsync(d => d.Id == dto.DesignationId);
        if (!desigExists) return false;

        var existing = await _context.EmployeeDesignations.Where(ed => ed.EmployeeId == id).ToListAsync();
        _context.EmployeeDesignations.RemoveRange(existing);

        _context.EmployeeDesignations.Add(new EmployeeDesignation
        {
            EmployeeId = id,
            DesignationId = dto.DesignationId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    // GET SUBORDINATES
    public async Task<List<EmployeeSubordinateDto>> GetSubordinatesAsync(int employeeId)
    {
        return await _context.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.EmployeeDesignations).ThenInclude(ed => ed.Designation)
            .Where(e => e.SupervisorId == employeeId)
            .Select(e => new EmployeeSubordinateDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations.Select(ed => ed.Designation.Name).FirstOrDefault() ?? "",
                IsActive = e.IsActive
            })
            .ToListAsync();
    }

    // GET SUPERVISOR
    public async Task<EmployeeSupervisorDto?> GetSupervisorAsync(int employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        if (employee == null || !employee.SupervisorId.HasValue) return null;

        return await _context.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .Include(e => e.Team)
            .Include(e => e.EmployeeDesignations).ThenInclude(ed => ed.Designation)
            .Where(e => e.Id == employee.SupervisorId.Value)
            .Select(e => new EmployeeSupervisorDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,
                Department = e.Department != null ? e.Department.Name : "",
                Team = e.Team != null ? e.Team.Name : "",
                Designation = e.EmployeeDesignations.Select(ed => ed.Designation.Name).FirstOrDefault() ?? "",
                IsActive = e.IsActive
            })
            .FirstOrDefaultAsync();
    }
}
