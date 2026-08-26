using EmpManagementAPI2.DTOs.Department;

namespace EmpManagementAPI2.Interfaces;

public interface IDepartmentRepository
{
    Task<bool> CreateDepartmentAsync(CreateDepartmentDto dto);
}