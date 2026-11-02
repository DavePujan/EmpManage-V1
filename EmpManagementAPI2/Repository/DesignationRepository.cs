using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Designation;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class DesignationRepository : IDesignationRepository
{
    private readonly AppDbContext _context;

    public DesignationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CreateDesignationAsync(CreateDesignationDto dto)
    {
        var designationExists = await _context.Designations
            .AnyAsync(d => d.Name.ToLower() == dto.Name.Trim().ToLower());

        if (designationExists)
        {
            return false;
        }

        var designation = new Designation
        {
            Name = dto.Name.Trim(),
            Description = dto.Description ?? string.Empty,
            IsActive = true
        };

        _context.Designations.Add(designation);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<DesignationListItemDto>> GetAllDesignationsAsync()
    {
        return await _context.Designations
            .AsNoTracking()
            .Select(d => new DesignationListItemDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                EmployeeCount = _context.EmployeeDesignations.Count(ed => ed.DesignationId == d.Id)
            })
            .ToListAsync();
    }

    public async Task<DesignationDetailsDto?> GetDesignationByIdAsync(int id)
    {
        return await _context.Designations
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DesignationDetailsDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                EmployeeCount = _context.EmployeeDesignations.Count(ed => ed.DesignationId == d.Id)
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateDesignationAsync(int id, UpdateDesignationDto dto)
    {
        var designation = await _context.Designations.FindAsync(id);
        if (designation == null)
        {
            return false;
        }

        var nameExists = await _context.Designations
            .AnyAsync(d => d.Id != id && d.Name.ToLower() == dto.Name.Trim().ToLower());

        if (nameExists)
        {
            return false;
        }

        designation.Name = dto.Name.Trim();
        designation.Description = dto.Description ?? string.Empty;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteDesignationAsync(int id)
    {
        var designation = await _context.Designations.FindAsync(id);
        if (designation == null)
        {
            return false;
        }

        var hasEmployees = await _context.EmployeeDesignations
            .AnyAsync(ed => ed.DesignationId == id);

        if (hasEmployees)
        {
            return false;
        }

        _context.Designations.Remove(designation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateDesignationStatusAsync(int id, UpdateDesignationStatusDto dto)
    {
        var designation = await _context.Designations.FindAsync(id);
        if (designation == null)
        {
            return false;
        }

        designation.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DesignationEmployeeDto>> GetEmployeesByDesignationAsync(int id)
    {
        return await _context.EmployeeDesignations
            .AsNoTracking()
            .Where(ed => ed.DesignationId == id)
            .Select(ed => new DesignationEmployeeDto
            {
                Id = ed.Employee.Id,
                Name = ed.Employee.Name,
                Email = ed.Employee.Email,
                DepartmentId = ed.Employee.DepartmentId,
                TeamId = ed.Employee.TeamId,
                IsActive = ed.Employee.IsActive
            })
            .ToListAsync();
    }
}
