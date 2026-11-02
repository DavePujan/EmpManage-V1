using System.Security.Claims;
using EmpManagementAPI2.DTOs.Leave;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeaveController(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }


    // =========================================================
    // 1. EMPLOYEE - APPLY FOR LEAVE
    // POST: api/Leave
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CreateLeave(
        CreateLeaveRequestDto dto)
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var result = await _leaveService.CreateLeaveAsync(
            employeeId.Value,
            dto);

        if (result == null)
        {
            return BadRequest(
                "Leave request could not be created.");
        }

        return Ok(result);
    }


    // =========================================================
    // 2. EMPLOYEE - MY LEAVES
    // GET: api/Leave/my
    // =========================================================

    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyLeaves()
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var leaves = await _leaveService.GetMyLeavesAsync(
            employeeId.Value);

        return Ok(leaves);
    }


    // =========================================================
    // 3. EMPLOYEE - LEAVE DETAILS
    // GET: api/Leave/{id}
    // =========================================================

    [HttpGet("{id}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetLeaveById(int id)
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var leave = await _leaveService.GetLeaveByIdAsync(id);

        if (leave == null)
        {
            return NotFound("Leave request not found.");
        }

        if (leave.EmployeeId != employeeId.Value)
        {
            return Forbid();
        }

        return Ok(leave);
    }


    // =========================================================
    // 4. MANAGER + HR + ADMIN - ALL LEAVES
    // GET: api/Leave/all
    // =========================================================

    [HttpGet("all")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public async Task<IActionResult> GetAllLeaves()
    {
        var leaves = await _leaveService.GetAllLeavesAsync();

        return Ok(leaves);
    }


    // =========================================================
    // 5. MANAGER + HR + ADMIN - PENDING LEAVES
    // GET: api/Leave/pending
    // =========================================================

    [HttpGet("pending")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public async Task<IActionResult> GetPendingLeaves()
    {
        var leaves = await _leaveService.GetPendingLeavesAsync();

        return Ok(leaves);
    }


    // =========================================================
    // 6. HR - TEAM LEAVES
    // GET: api/Leave/team
    // =========================================================

    [HttpGet("team")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetTeamLeaves()
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var leaves = await _leaveService.GetTeamLeavesAsync(
            employeeId.Value);

        return Ok(leaves);
    }


    // =========================================================
    // 7. HR - APPROVE LEAVE
    // PUT: api/Leave/{id}/approve
    // =========================================================

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> ApproveLeave(int id)
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var result = await _leaveService.ApproveLeaveAsync(
            id,
            employeeId.Value);

        if (!result)
        {
            return BadRequest(
                "Leave could not be approved. It may not exist or may already be processed.");
        }

        return Ok("Leave approved successfully.");
    }


    // =========================================================
    // 8. HR - REJECT LEAVE
    // PUT: api/Leave/{id}/reject
    // =========================================================

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> RejectLeave(
        int id,
        LeaveActionDto dto)
    {
        var employeeId = await GetEmployeeIdAsync();

        if (employeeId == null)
        {
            return BadRequest("Employee record not found.");
        }

        var result = await _leaveService.RejectLeaveAsync(
            id,
            employeeId.Value,
            dto.Reason);

        if (!result)
        {
            return BadRequest(
                "Leave could not be rejected. It may not exist or may already be processed.");
        }

        return Ok("Leave rejected successfully.");
    }


    // =========================================================
    // GET LOGGED-IN EMPLOYEE ID
    // =========================================================

    private async Task<int?> GetEmployeeIdAsync()
    {
        var appUserIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier);

        if (appUserIdClaim == null)
        {
            return null;
        }

        if (!int.TryParse(
                appUserIdClaim.Value,
                out var appUserId))
        {
            return null;
        }

        // We need to get EmployeeId from AppUserId.
        return await _leaveService.GetEmployeeIdByAppUserIdAsync(
            appUserId);
    }

    // CANCEL LEAVE
    [HttpPut("{id:int}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelLeave(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        var result = await _leaveService
            .CancelLeaveAsync(id, userId);

        if (!result)
        {
            return BadRequest(
                "Leave could not be cancelled. It may not exist, may not belong to you, or may no longer be pending.");
        }

        return Ok("Leave cancelled successfully.");
    }

    // SEARCH / FILTER LEAVES
    [HttpPost("search")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public async Task<IActionResult> SearchLeaves([FromBody] LeaveFilterDto filter)
    {
        var result = await _leaveService.SearchLeavesAsync(filter);
        return Ok(result);
    }
}