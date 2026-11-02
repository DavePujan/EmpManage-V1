using EmpManagementAPI2.DTOs.Auth;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmpManagementAPI2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _authService.LoginAsync(
            dto.Username,
            dto.Password);

        if (token == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        return Ok(new
        {
            token = token
        });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
    ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user identity.");
        }

        var result = await _authService
            .ChangePasswordAsync(userId, dto);

        if (!result)
        {
            return BadRequest(
                "Password could not be changed. Check your current password and make sure the new passwords match.");
        }

        return Ok("Password changed successfully.");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);

        return Ok("If an account with this email exists, a temporary password has been sent.");
    }
}
