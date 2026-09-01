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


   


    // CREATE EMPLOYEE
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

    // GET ALL EMPLOYEES
    public async Task<List<EmployeeListDto>> GetAllEmployeesAsync()
    {
        return await _employeeRepository.GetAllEmployeesAsync();
    }

    // GET EMPLOYEE BY ID
    public async Task<EmployeeListDto?> GetEmployeeByIdAsync(int id)
    {
        return await _employeeRepository.GetEmployeeByIdAsync(id);
    }

    // UPDATE EMPLOYEE
    public async Task<bool> UpdateEmployeeAsync(
        int id,
        UpdateEmployeeDto dto)
    {
        return await _employeeRepository
            .UpdateEmployeeAsync(id, dto);
    }

    // DELETE EMPLOYEE
    public async Task<bool> DeleteEmployeeAsync(int id)
    {
        return await _employeeRepository
            .DeleteEmployeeAsync(id);
    }

    // GET EMPLOYEE COUNT
    public async Task<int> GetEmployeeCountAsync()
    {
        return await _employeeRepository
            .GetEmployeeCountAsync();
    }

    // GENERATE TEMPORARY PASSWORD
    private string GenerateTemporaryPassword()
    {
        return $"Emp@{Random.Shared.Next(100000, 999999)}";

    }

    // UPDATE EMPLOYEE STATUS
    public async Task<bool> UpdateEmployeeStatusAsync(
        int id,
        UpdateEmployeeStatusDto dto)
    {
        return await _employeeRepository
            .UpdateEmployeeStatusAsync(id, dto);
    }
    //employee apni profile  details  dekh payega
    public async Task<EmployeeListDto?> GetMyProfileAsync(int userId)
    {
        return await _employeeRepository.GetMyProfileAsync(userId);
    }

    //employee apnaprofile edit kar sakta he
    public async Task<bool> UpdateMyProfileAsync(
    int userId,
    UpdateMyProfileDto dto)
    {
        return await _employeeRepository
            .UpdateMyProfileAsync(userId, dto);
    }
}