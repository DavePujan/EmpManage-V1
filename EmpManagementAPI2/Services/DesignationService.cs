using EmpManagementAPI2.DTOs.Designation;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class DesignationService : IDesignationService
{
    private readonly IDesignationRepository _designationRepository;

    public DesignationService(IDesignationRepository designationRepository)
    {
        _designationRepository = designationRepository;
    }

    public async Task<bool> CreateDesignationAsync(CreateDesignationDto dto)
    {
        return await _designationRepository.CreateDesignationAsync(dto);
    }

    public async Task<IEnumerable<DesignationListItemDto>> GetAllDesignationsAsync()
    {
        return await _designationRepository.GetAllDesignationsAsync();
    }

    public async Task<DesignationDetailsDto?> GetDesignationByIdAsync(int id)
    {
        return await _designationRepository.GetDesignationByIdAsync(id);
    }

    public async Task<bool> UpdateDesignationAsync(int id, UpdateDesignationDto dto)
    {
        return await _designationRepository.UpdateDesignationAsync(id, dto);
    }

    public async Task<bool> DeleteDesignationAsync(int id)
    {
        return await _designationRepository.DeleteDesignationAsync(id);
    }

    public async Task<bool> UpdateDesignationStatusAsync(int id, UpdateDesignationStatusDto dto)
    {
        return await _designationRepository.UpdateDesignationStatusAsync(id, dto);
    }

    public async Task<List<DesignationEmployeeDto>> GetEmployeesByDesignationAsync(int id)
    {
        return await _designationRepository.GetEmployeesByDesignationAsync(id);
    }
}
