using EmpManagementAPI2.DTOs.Employee;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

    // CREATE EMPLOYEE
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

    // GET ALL EMPLOYEES
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _employeeService.GetAllEmployeesAsync();

        return Ok(employees);
    }

    // GET EMPLOYEE BY ID
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        var employee = await _employeeService
            .GetEmployeeByIdAsync(id);

        if (employee == null)
        {
            return NotFound("Employee not found.");
        }

        return Ok(employee);
    }

    // UPDATE EMPLOYEE
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEmployee(
        int id,
        UpdateEmployeeDto dto)
    {
        var result = await _employeeService
            .UpdateEmployeeAsync(id, dto);

        if (!result)
        {
            return BadRequest(
                "Employee could not be updated. Employee, email, department, team, or designation may be invalid.");
        }

        return Ok("Employee updated successfully.");
    }

    // DELETE EMPLOYEE
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var result = await _employeeService
            .DeleteEmployeeAsync(id);

        if (!result)
        {
            return NotFound("Employee not found.");
        }

        return Ok("Employee deleted successfully.");
    }

    // GET EMPLOYEE COUNT
    [HttpGet("count")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetEmployeeCount()
    {
        var count = await _employeeService
            .GetEmployeeCountAsync();

        return Ok(new
        {
            TotalEmployees = count
        });
    }

    // UPDATE EMPLOYEE STATUS
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEmployeeStatus(
        int id,
        UpdateEmployeeStatusDto dto)
    {
        var result = await _employeeService
            .UpdateEmployeeStatusAsync(id, dto);

        if (!result)
        {
            return NotFound("Employee not found.");
        }

        return Ok("Employee status updated successfully.");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        var employee = await _employeeService
            .GetMyProfileAsync(userId);

        if (employee == null)
        {
            return NotFound("Employee profile not found.");
        }

        return Ok(employee);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile(
    UpdateMyProfileDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        var result = await _employeeService
            .UpdateMyProfileAsync(userId, dto);

        if (!result)
        {
            return BadRequest(
                "Profile could not be updated. The email may already be in use.");
        }

        return Ok("Profile updated successfully.");
    }


}