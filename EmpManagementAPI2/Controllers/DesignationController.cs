using EmpManagementAPI2.DTOs.Designation;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DesignationController : ControllerBase
{
    private readonly IDesignationService _designationService;

    public DesignationController(
        IDesignationService designationService)
    {
        _designationService = designationService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDesignation(
        CreateDesignationDto dto)
    {
        var result = await _designationService
            .CreateDesignationAsync(dto);

        if (!result)
        {
            return BadRequest("Designation already exists.");
        }

        return Ok("Designation created successfully.");
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDesignations()
    {
        var designations = await _designationService
            .GetAllDesignationsAsync();

        return Ok(designations);
    }
}