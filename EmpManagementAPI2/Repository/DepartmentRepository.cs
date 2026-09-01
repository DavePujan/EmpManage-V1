using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CreateDepartmentAsync(
        CreateDepartmentDto dto)
    {
        // Check whether department already exists
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Name == dto.Name);

        if (departmentExists)
        {
            return false;
        }

        // Create department
        var department = new Models.Department
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true
        };

        _context.Departments.Add(department);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<DepartmentListDto>> GetAllDepartmentsAsync()
    {
        return await _context.Departments
            .Select(d => new DepartmentListDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                TotalEmployees = d.Employees.Count(),
                TotalTeams = d.Teams.Count(),
                IsActive = d.IsActive
            })
            .ToListAsync();
    }

    public async Task<DepartmentListDto?> GetDepartmentByIdAsync(
        int id)
    {
        return await _context.Departments
            .Where(d => d.Id == id)
            .Select(d => new DepartmentListDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                TotalEmployees = d.Employees.Count(),
                TotalTeams = d.Teams.Count(),
                IsActive = d.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetDepartmentCountAsync()
    {
        return await _context.Departments
            .CountAsync();
    }

    public async Task<List<TeamListDto>> GetTeamsByDepartmentAsync(
    int departmentId)
    {
        return await _context.Teams
            .Where(t => t.DepartmentId == departmentId)
            .Select(t => new TeamListDto
            {
                Id = t.Id,
                Name = t.Name,

                EmployeeCount = t.Employees.Count(),

                TeamHead = t.TeamHeadEmployee != null
                    ? t.TeamHeadEmployee.Name
                    : "",

                IsActive = t.IsActive
            })
            .ToListAsync();
    }

    public async Task<List<DepartmentEmployeeDto>> GetEmployeesByDepartmentAsync(
    int departmentId)
    {
        return await _context.Employees
            .Where(e => e.DepartmentId == departmentId)
            .Select(e => new DepartmentEmployeeDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,

                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",

                Team = e.Team != null
                    ? e.Team.Name
                    : "",

                IsActive = e.IsActive
            })
            .ToListAsync();
    }
}