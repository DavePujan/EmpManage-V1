using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<bool> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        return await _departmentRepository
            .CreateDepartmentAsync(dto);
    }
}