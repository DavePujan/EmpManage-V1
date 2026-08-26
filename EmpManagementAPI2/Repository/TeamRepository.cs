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

    public async Task<bool> CreateTeamAsync(CreateTeamDto dto)
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

        // Create Team
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
}