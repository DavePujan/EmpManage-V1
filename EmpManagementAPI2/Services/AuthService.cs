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
    private readonly IEmailService _emailService;

    public AuthService(
        AppDbContext context,
        IPasswordService passwordService,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
        _emailService = emailService;
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

        // Get user roles
        var roles = await _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Name)
            .ToListAsync();

        // Generate JWT token
        var tokenHandler = new JwtSecurityTokenHandler();

        var key = Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),

            Expires = DateTime.UtcNow.AddMinutes(
                double.Parse(_configuration["Jwt:DurationInMinutes"]!)),

            Issuer = _configuration["Jwt:Issuer"],

            Audience = _configuration["Jwt:Audience"],

            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public async Task<bool> ChangePasswordAsync(
        int userId,
        ChangePasswordDto dto)
    {
        // New passwords must match
        if (dto.NewPassword != dto.ConfirmPassword)
        {
            return false;
        }

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

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return false;
        }

        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());

        // Do not reveal whether email exists for security reasons
        if (user == null)
        {
            return true;
        }

        // Generate temporary password
        const string characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        string temporaryPassword = new string(
            Enumerable.Range(0, 10)
                .Select(_ => characters[System.Security.Cryptography.RandomNumberGenerator.GetInt32(characters.Length)])
                .ToArray());

        // Create password hash and salt
        _passwordService.CreatePasswordHash(
            temporaryPassword,
            out byte[] passwordHash,
            out byte[] passwordSalt);

        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;

        await _context.SaveChangesAsync();

        // Send temporary password email
        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, temporaryPassword);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ForgotPassword Warning] Failed to send email: {ex.Message}");
        }

        return true;
    }
}
