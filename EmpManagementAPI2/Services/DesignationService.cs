using EmpManagementAPI2.DTOs.Designation;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class DesignationService : IDesignationService
{
    private readonly IDesignationRepository _designationRepository;

    public DesignationService(
        IDesignationRepository designationRepository)
    {
        _designationRepository = designationRepository;
    }

    public async Task<bool> CreateDesignationAsync(
        CreateDesignationDto dto)
    {
        return await _designationRepository
            .CreateDesignationAsync(dto);
    }
}