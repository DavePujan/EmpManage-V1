namespace EmpManagementAPI2.DTOs.Auth;

public class InitialAdminCreateDto
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
}