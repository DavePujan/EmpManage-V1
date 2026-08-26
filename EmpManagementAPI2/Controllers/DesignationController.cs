using EmpManagementAPI2.DTOs.Designation;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DesignationController : ControllerBase
{
    private readonly IDesignationService _designationService;

    public DesignationController(
        IDesignationService designationService)
    {
        _designationService = designationService;
    }

    [HttpPost]
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
}