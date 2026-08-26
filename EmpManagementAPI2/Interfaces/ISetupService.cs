using EmpManagementAPI2.DTOs.Auth;

namespace EmpManagementAPI2.Interfaces;

public interface ISetupService
{
    Task<bool> CreateInitialAdminAsync(InitialAdminCreateDto dto);
}