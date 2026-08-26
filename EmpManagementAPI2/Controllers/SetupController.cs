using EmpManagementAPI2.DTOs.Auth;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly ISetupService _setupService;

    public SetupController(ISetupService setupService)
    {
        _setupService = setupService;
    }

    [HttpPost("admin")]
    public async Task<IActionResult> CreateInitialAdmin(
        InitialAdminCreateDto dto)
    {
        var result = await _setupService.CreateInitialAdminAsync(dto);

        if (!result)
        {
            return Conflict("Initial Admin already exists or Admin role is missing.");
        }

        return Ok("Initial Admin created successfully.");
    }
}