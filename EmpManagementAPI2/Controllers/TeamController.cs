using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTeam(CreateTeamDto dto)
    {
        var result = await _teamService.CreateTeamAsync(dto);

        if (!result)
        {
            return BadRequest(
                "Department does not exist or team already exists.");
        }

        return Ok("Team created successfully.");
    }
}