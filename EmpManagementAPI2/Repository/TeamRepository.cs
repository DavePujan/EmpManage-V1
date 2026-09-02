using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }

    // CREATE TEAM
    public async Task<bool> CreateTeamAsync(
        CreateTeamDto dto)
    {
        // Check whether department exists
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Id == dto.DepartmentId);

        if (!departmentExists)
        {
            return false;
        }

        // Check whether team already exists in this department
        var teamExists = await _context.Teams
            .AnyAsync(t =>
                t.Name == dto.Name &&
                t.DepartmentId == dto.DepartmentId);

        if (teamExists)
        {
            return false;
        }

        var team = new Team
        {
            Name = dto.Name,
            DepartmentId = dto.DepartmentId,
            TeamHeadEmployeeId = null,
            IsActive = true
        };

        _context.Teams.Add(team);

        await _context.SaveChangesAsync();

        return true;
    }

    // GET ALL TEAMS
    public async Task<List<TeamListDto>> GetAllTeamsAsync()
    {
        return await _context.Teams
            .Select(t => new TeamListDto
            {
                Id = t.Id,

                Name = t.Name,

                DepartmentId = t.DepartmentId,

                Department = t.Department.Name,

                EmployeeCount = t.Employees.Count(),

                TeamHead = t.TeamHeadEmployee != null
                    ? t.TeamHeadEmployee.Name
                    : "",

                IsActive = t.IsActive
            })
            .ToListAsync();
    }

    // GET TEAM BY ID
    public async Task<TeamDetailsDto?> GetTeamByIdAsync(
        int id)
    {
        return await _context.Teams
            .Where(t => t.Id == id)
            .Select(t => new TeamDetailsDto
            {
                Id = t.Id,
                Name = t.Name,

                DepartmentId = t.DepartmentId,

                Department = t.Department.Name,

                TeamHeadEmployeeId = t.TeamHeadEmployeeId,

                TeamHead = t.TeamHeadEmployee != null
                    ? t.TeamHeadEmployee.Name
                    : "",

                EmployeeCount = t.Employees.Count(),

                IsActive = t.IsActive
            })
            .FirstOrDefaultAsync();
    }

    // GET EMPLOYEES BY TEAM
    public async Task<List<TeamEmployeeDto>> GetEmployeesByTeamAsync(
        int teamId)
    {
        return await _context.Employees
            .Where(e => e.TeamId == teamId)
            .Select(e => new TeamEmployeeDto
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,

                Designation = e.EmployeeDesignations
                    .Select(ed => ed.Designation.Name)
                    .FirstOrDefault() ?? "",

                IsActive = e.IsActive
            })
            .ToListAsync();
    }

    // GET TOTAL TEAM COUNT
    public async Task<int> GetTeamCountAsync()
    {
        return await _context.Teams.CountAsync();
    }
}