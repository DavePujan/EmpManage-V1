using EmpManagementAPI2.DTOs.Auth;

namespace EmpManagementAPI2.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(string username, string password);

    Task<bool> ChangePasswordAsync(
        int userId,
        ChangePasswordDto dto);

    Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
}
