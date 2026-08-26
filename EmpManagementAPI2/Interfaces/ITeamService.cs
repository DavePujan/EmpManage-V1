using EmpManagementAPI2.DTOs.Team;

namespace EmpManagementAPI2.Interfaces;

public interface ITeamService
{
    Task<bool> CreateTeamAsync(CreateTeamDto dto);
}