using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Auth;
using EmpManagementAPI2.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EmpManagementAPI2.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthService(
        AppDbContext context,
        IPasswordService passwordService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task<string?> LoginAsync(
        string username,
        string password)
    {
        // Find user
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
        {
            return null;
        }

        // Check if account is active
        if (!user.IsActive)
        {
            return null;
        }

        // Verify password
        var passwordValid = _passwordService.VerifyPassword(
            password,
            user.PasswordHash,
            user.PasswordSalt);

        if (!passwordValid)
        {
            return null;
        }

        // Get user's role
        var userRole = await _context.UserRoles
            .Include(ur => ur.Role)
            .FirstOrDefaultAsync(ur => ur.UserId == user.Id);

        if (userRole == null)
        {
            return null;
        }

        // Create claims
        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(
                ClaimTypes.Name,
                user.Username),

            new Claim(
                ClaimTypes.Role,
                userRole.Role.Name)
        };

        // Get JWT settings
        var key = _configuration["Jwt:Key"]!;

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        // Create JWT
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(
                    _configuration["Jwt:ExpiryMinutes"])),
            signingCredentials: credentials);

        // Convert JWT object to string
        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    public async Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordDto dto)
    {
        // Check whether new password and confirm password match
        if (dto.NewPassword != dto.ConfirmPassword)
        {
            return false;
        }

        // Find the user
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return false;
        }

        // Check whether current password is correct
        var passwordValid = _passwordService.VerifyPassword(
            dto.CurrentPassword,
            user.PasswordHash,
            user.PasswordSalt);

        if (!passwordValid)
        {
            return false;
        }

        // Create hash and salt for new password
        _passwordService.CreatePasswordHash(
            dto.NewPassword,
            out byte[] newPasswordHash,
            out byte[] newPasswordSalt);

        // Update password
        user.PasswordHash = newPasswordHash;
        user.PasswordSalt = newPasswordSalt;

        await _context.SaveChangesAsync();

        return true;
    }
}