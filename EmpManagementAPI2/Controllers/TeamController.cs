using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(
        ITeamService teamService)
    {
        _teamService = teamService;
    }

    // POST: api/Team
    // Admin only
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTeam(
        CreateTeamDto dto)
    {
        var result = await _teamService
            .CreateTeamAsync(dto);

        if (!result)
        {
            return BadRequest(
                "Department does not exist or team already exists.");
        }

        return Ok("Team created successfully.");
    }

    // GET: api/Team
    // Admin + HR
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAllTeams()
    {
        var teams = await _teamService
            .GetAllTeamsAsync();

        return Ok(teams);
    }

    // GET: api/Team/1
    // Admin + HR
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetTeamById(
        int id)
    {
        var team = await _teamService
            .GetTeamByIdAsync(id);

        if (team == null)
        {
            return NotFound("Team not found.");
        }

        return Ok(team);
    }

    // GET: api/Team/1/employees
    // Admin + HR
    [HttpGet("{id:int}/employees")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetTeamEmployees(
        int id)
    {
        var team = await _teamService
            .GetTeamByIdAsync(id);

        if (team == null)
        {
            return NotFound("Team not found.");
        }

        var employees = await _teamService
            .GetEmployeesByTeamAsync(id);

        return Ok(employees);
    }

    // GET: api/Team/count
    // Admin + HR
    [HttpGet("count")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetTeamCount()
    {
        var count = await _teamService
            .GetTeamCountAsync();

        return Ok(new
        {
            totalTeams = count
        });
    }
}