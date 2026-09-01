using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(
        IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<bool> CreateDepartmentAsync(
        CreateDepartmentDto dto)
    {
        return await _departmentRepository
            .CreateDepartmentAsync(dto);
    }

    public async Task<List<DepartmentListDto>> GetAllDepartmentsAsync()
    {
        return await _departmentRepository
            .GetAllDepartmentsAsync();
    }

    public async Task<DepartmentListDto?> GetDepartmentByIdAsync(
        int id)
    {
        return await _departmentRepository
            .GetDepartmentByIdAsync(id);
    }

    public async Task<int> GetDepartmentCountAsync()
    {
        return await _departmentRepository
            .GetDepartmentCountAsync();
    }

    public async Task<List<TeamListDto>> GetTeamsByDepartmentAsync(
        int departmentId)
    {
        return await _departmentRepository
            .GetTeamsByDepartmentAsync(departmentId);
    }

    public async Task<List<DepartmentEmployeeDto>> GetEmployeesByDepartmentAsync(
    int departmentId)
    {
        return await _departmentRepository
            .GetEmployeesByDepartmentAsync(departmentId);
    }
}