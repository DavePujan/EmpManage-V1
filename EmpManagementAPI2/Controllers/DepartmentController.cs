using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentController(
        IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    // POST: api/Department
    // Only Admin can create a department
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDepartment(
        CreateDepartmentDto dto)
    {
        var result = await _departmentService
            .CreateDepartmentAsync(dto);

        if (!result)
        {
            return BadRequest("Department already exists.");
        }

        return Ok("Department created successfully.");
    }

    // GET: api/Department
    // Admin and HR can view departments
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAllDepartments()
    {
        var departments = await _departmentService
            .GetAllDepartmentsAsync();

        return Ok(departments);
    }

    // GET: api/Department/1
    // Admin and HR can view a particular department
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetDepartmentById(
        int id)
    {
        var department = await _departmentService
            .GetDepartmentByIdAsync(id);

        if (department == null)
        {
            return NotFound("Department not found.");
        }

        return Ok(department);
    }

    // GET: api/Department/count
    // Admin and HR can view total departments
    [HttpGet("count")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetDepartmentCount()
    {
        var count = await _departmentService
            .GetDepartmentCountAsync();

        return Ok(new
        {
            totalDepartments = count
        });
    }

    // GET: api/Department/1/teams
    // Admin and HR can view department teams
    [HttpGet("{id:int}/teams")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetDepartmentTeams(
        int id)
    {
        var department = await _departmentService
            .GetDepartmentByIdAsync(id);

        if (department == null)
        {
            return NotFound("Department not found.");
        }

        var teams = await _departmentService
            .GetTeamsByDepartmentAsync(id);

        return Ok(teams);
    }

    // GET: api/Department/1/employees
    // Admin and HR can view department employees
    [HttpGet("{id:int}/employees")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetDepartmentEmployees(
        int id)
    {
        var department = await _departmentService
            .GetDepartmentByIdAsync(id);

        if (department == null)
        {
            return NotFound("Department not found.");
        }

        var employees = await _departmentService
            .GetEmployeesByDepartmentAsync(id);

        return Ok(employees);
    }
}