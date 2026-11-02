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

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreateEmployee(CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        bool result = await _employeeService.CreateEmployeeAsync(dto);

        if (!result)
        {
            return Conflict("Employee could not be created. Check if username or email already exists, or if role/department/team/designation IDs are valid.");
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

    [HttpPost("search")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> SearchEmployees([FromBody] EmployeeFilterDto filter)
    {
        var result = await _employeeService.SearchEmployeesAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        var employee = await _employeeService.GetEmployeeByIdAsync(id);

        if (employee == null)
        {
            return NotFound("Employee not found.");
        }

        return Ok(employee);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployee(int id, UpdateEmployeeDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        bool result = await _employeeService.UpdateEmployeeAsync(id, dto);

        if (!result)
        {
            return Conflict("Employee could not be updated. Check if email is already in use by another user, or if designation/department/team/supervisor is valid.");
        }

        return Ok("Employee updated successfully.");
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.DeleteEmployeeAsync(id);

        if (!result)
        {
            return NotFound("Employee not found.");
        }

        return Ok("Employee deleted successfully.");
    }

    [HttpGet("count")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetEmployeeCount()
    {
        int count = await _employeeService.GetEmployeeCountAsync();
        return Ok(new { count });
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployeeStatus(int id, UpdateEmployeeStatusDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.UpdateEmployeeStatusAsync(id, dto);

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

        var employee = await _employeeService.GetMyProfileAsync(userId);

        if (employee == null)
        {
            return NotFound("Profile not found.");
        }

        return Ok(employee);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile(UpdateMyProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        bool result = await _employeeService.UpdateMyProfileAsync(userId, dto);

        if (!result)
        {
            return Conflict("Profile could not be updated. The email may already be in use.");
        }

        return Ok("Profile updated successfully.");
    }

    [HttpPut("{id:int}/department")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployeeDepartment(int id, UpdateEmployeeDepartmentDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.UpdateEmployeeDepartmentAsync(id, dto);
        if (!result)
        {
            return Conflict("Employee or Department not found.");
        }

        return Ok("Employee department updated successfully.");
    }

    [HttpPut("{id:int}/team")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployeeTeam(int id, UpdateEmployeeTeamDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.UpdateEmployeeTeamAsync(id, dto);
        if (!result)
        {
            return Conflict("Employee or Team not found, or Team does not belong to Employee's department.");
        }

        return Ok("Employee team updated successfully.");
    }

    [HttpPut("{id:int}/supervisor")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployeeSupervisor(int id, UpdateEmployeeSupervisorDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.UpdateEmployeeSupervisorAsync(id, dto);
        if (!result)
        {
            return Conflict("Employee or Supervisor not found, or employee cannot supervise themselves.");
        }

        return Ok("Employee supervisor updated successfully.");
    }

    [HttpPut("{id:int}/designation")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateEmployeeDesignation(int id, UpdateEmployeeDesignationDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        bool result = await _employeeService.UpdateEmployeeDesignationAsync(id, dto);
        if (!result)
        {
            return Conflict("Employee or Designation not found.");
        }

        return Ok("Employee designation updated successfully.");
    }

    [HttpGet("{id:int}/subordinates")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetSubordinates(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        var employee = await _employeeService.GetEmployeeByIdAsync(id);
        if (employee == null)
        {
            return NotFound("Employee not found.");
        }

        var subordinates = await _employeeService.GetSubordinatesAsync(id);
        return Ok(subordinates);
    }

    [HttpGet("{id:int}/supervisor")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetSupervisor(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Employee ID must be greater than zero.");
        }

        var employee = await _employeeService.GetEmployeeByIdAsync(id);
        if (employee == null)
        {
            return NotFound("Employee not found.");
        }

        var supervisor = await _employeeService.GetSupervisorAsync(id);
        if (supervisor == null)
        {
            return NotFound("No supervisor assigned to this employee.");
        }

        return Ok(supervisor);
    }
}
