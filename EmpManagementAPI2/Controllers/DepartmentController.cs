using EmpManagementAPI2.DTOs.Department;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpPost]
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
}