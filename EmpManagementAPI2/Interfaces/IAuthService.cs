namespace EmpManagementAPI2.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(string username, string password);
}