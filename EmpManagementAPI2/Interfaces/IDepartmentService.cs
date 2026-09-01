using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.DTOs.Team;

namespace EmpManagementAPI2.Interfaces;

public interface IDepartmentService
{
    Task<bool> CreateDepartmentAsync(
        CreateDepartmentDto dto);

    Task<List<DepartmentListDto>> GetAllDepartmentsAsync();

    Task<DepartmentListDto?> GetDepartmentByIdAsync(
        int id);

    Task<int> GetDepartmentCountAsync();

    Task<List<TeamListDto>> GetTeamsByDepartmentAsync(
        int departmentId);

    Task<List<DepartmentEmployeeDto>> GetEmployeesByDepartmentAsync(
    int departmentId);
}