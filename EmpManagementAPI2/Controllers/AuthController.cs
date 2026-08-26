using EmpManagementAPI2.DTOs.Auth;
using EmpManagementAPI2.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
}