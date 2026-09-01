using EmpManagementAPI2.DTOs.Employee;

namespace EmpManagementAPI2.Interfaces;

public interface IEmployeeService
{
    Task<bool> CreateEmployeeAsync(CreateEmployeeDto dto);

    Task<List<EmployeeListDto>> GetAllEmployeesAsync();

    Task<EmployeeListDto?> GetEmployeeByIdAsync(int id);

    Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);

    Task<bool> DeleteEmployeeAsync(int id);

    Task<int> GetEmployeeCountAsync();

    Task<bool> UpdateEmployeeStatusAsync(
    int id,
    UpdateEmployeeStatusDto dto);

    Task<EmployeeListDto?> GetMyProfileAsync(int userId);

    Task<bool> UpdateMyProfileAsync(
    int userId,
    UpdateMyProfileDto dto);
}