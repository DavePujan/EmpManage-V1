using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;

    public TeamService(
        ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<bool> CreateTeamAsync(
        CreateTeamDto dto)
    {
        return await _teamRepository
            .CreateTeamAsync(dto);
    }

    public async Task<List<TeamListDto>> GetAllTeamsAsync()
    {
        return await _teamRepository
            .GetAllTeamsAsync();
    }

    public async Task<TeamDetailsDto?> GetTeamByIdAsync(
        int id)
    {
        return await _teamRepository
            .GetTeamByIdAsync(id);
    }

    public async Task<List<TeamEmployeeDto>> GetEmployeesByTeamAsync(
        int teamId)
    {
        return await _teamRepository
            .GetEmployeesByTeamAsync(teamId);
    }

    public async Task<int> GetTeamCountAsync()
    {
        return await _teamRepository
            .GetTeamCountAsync();
    }
}