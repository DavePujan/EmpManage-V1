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
            .AnyAsync(d => d.Name == dto.Name);

        if (designationExists)
        {
            return false;
        }

        var designation = new Designation
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true
        };

        _context.Designations.Add(designation);

        await _context.SaveChangesAsync();

        return true;
    }
}