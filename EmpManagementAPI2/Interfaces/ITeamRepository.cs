using EmpManagementAPI2.DTOs.Team;

namespace EmpManagementAPI2.Interfaces;

public interface ITeamRepository
{
    Task<bool> CreateTeamAsync(CreateTeamDto dto);
}