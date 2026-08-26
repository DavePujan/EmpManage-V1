using EmpManagementAPI2.DTOs.Employee;

namespace EmpManagementAPI2.Interfaces;

public interface IEmployeeService
{
    Task<bool> CreateEmployeeAsync(CreateEmployeeDto dto);

    Task<List<EmployeeListDto>> GetAllEmployeesAsync();
}