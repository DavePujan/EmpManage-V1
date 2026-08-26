using EmpManagementAPI2.DTOs.Employee;

namespace EmpManagementAPI2.Interfaces;

public interface IEmployeeRepository
{
    Task<bool> CreateEmployeeAsync(
        CreateEmployeeDto dto,
        string temporaryPassword);

    Task<List<EmployeeListDto>> GetAllEmployeesAsync();
}