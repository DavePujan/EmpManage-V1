using EmpManagementAPI2.DTOs.Team;

namespace EmpManagementAPI2.Interfaces;

public interface ITeamRepository
{
    Task<bool> CreateTeamAsync(
        CreateTeamDto dto);

    Task<List<TeamListDto>> GetAllTeamsAsync();

    Task<TeamDetailsDto?> GetTeamByIdAsync(
        int id);

    Task<List<TeamEmployeeDto>> GetEmployeesByTeamAsync(
        int teamId);

    Task<int> GetTeamCountAsync();
}