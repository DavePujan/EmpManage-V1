using EmpManagementAPI2.DTOs.Employee;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeeController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateEmployee(CreateEmployeeDto dto)
    {
        var result = await _employeeService.CreateEmployeeAsync(dto);

        if (!result)
        {
            return BadRequest(
                "Employee could not be created. Username, email, role, or related data may already exist or be invalid.");
        }

        return Ok("Employee created successfully.");
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _employeeService.GetAllEmployeesAsync();

        return Ok(employees);
    }
}