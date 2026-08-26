using EmpManagementAPI2.DTOs.Department;

namespace EmpManagementAPI2.Interfaces;

public interface IDepartmentService
{
    Task<bool> CreateDepartmentAsync(CreateDepartmentDto dto);
}