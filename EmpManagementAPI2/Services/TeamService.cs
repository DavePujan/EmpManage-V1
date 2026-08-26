using EmpManagementAPI2.DTOs.Team;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;

    public TeamService(ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<bool> CreateTeamAsync(CreateTeamDto dto)
    {
        return await _teamRepository.CreateTeamAsync(dto);
    }
}