using EmpManagementAPI2.DTOs.Employee;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IEmailService _emailService;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        IEmailService emailService)
    {
        _employeeRepository = employeeRepository;
        _emailService = emailService;
    }

    public async Task<bool> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        var temporaryPassword = GenerateTemporaryPassword();

        var employeeCreated = await _employeeRepository
            .CreateEmployeeAsync(dto, temporaryPassword);

        if (!employeeCreated)
        {
            return false;
        }

        await _emailService.SendEmployeeCredentialsAsync(
            dto.Email,
            dto.Username,
            temporaryPassword);

        return true;
    }

    public async Task<List<EmployeeListDto>> GetAllEmployeesAsync()
    {
        return await _employeeRepository.GetAllEmployeesAsync();
    }

    private string GenerateTemporaryPassword()
    {
        return $"Emp@{Random.Shared.Next(100000, 999999)}";
    }
}