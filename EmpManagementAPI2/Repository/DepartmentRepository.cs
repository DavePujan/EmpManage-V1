using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        // Check whether department already exists
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Name == dto.Name);

        if (departmentExists)
        {
            return false;
        }

        // Create department
        var department = new Department
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true
        };

        _context.Departments.Add(department);

        await _context.SaveChangesAsync();

        return true;
    }
}