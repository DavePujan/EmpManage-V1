using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Auth;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Services;

public class SetupService : ISetupService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public SetupService(
        AppDbContext context,
        IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<bool> CreateInitialAdminAsync(InitialAdminCreateDto dto)
    {
        // Find the Admin role
        var adminRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        // Admin role must exist
        if (adminRole == null)
        {
            return false;
        }

        // Check whether an Admin already exists
        var adminExists = await _context.UserRoles
            .AnyAsync(ur => ur.RoleId == adminRole.Id);

        if (adminExists)
        {
            return false;
        }

        // Start database transaction
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Create password hash and salt
            _passwordService.CreatePasswordHash(
                dto.Password,
                out byte[] passwordHash,
                out byte[] passwordSalt);

            // Create AppUser
            var appUser = new AppUser
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                IsActive = true
            };

            _context.AppUsers.Add(appUser);

            await _context.SaveChangesAsync();

            // Create Employee
            var employee = new Employee
            {
                AppUserId = appUser.Id,
                Name = dto.Name,
                Email = dto.Email,
                DepartmentId = null,
                TeamId = null,
                SupervisorId = null,
                JoiningDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.Employees.Add(employee);

            await _context.SaveChangesAsync();

            // Assign Admin role to the user
            var userRole = new UserRole
            {
                UserId = appUser.Id,
                RoleId = adminRole.Id
            };

            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            // Everything succeeded
            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            // Something failed, so undo all changes
            await transaction.RollbackAsync();

            return false;
        }
    }
}