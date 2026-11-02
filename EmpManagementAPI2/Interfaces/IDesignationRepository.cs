using EmpManagementAPI2.DTOs.Designation;

namespace EmpManagementAPI2.Interfaces;

public interface IDesignationRepository
{
    Task<bool> CreateDesignationAsync(CreateDesignationDto dto);
    Task<IEnumerable<DesignationListItemDto>> GetAllDesignationsAsync();
    Task<DesignationDetailsDto?> GetDesignationByIdAsync(int id);
    Task<bool> UpdateDesignationAsync(int id, UpdateDesignationDto dto);
    Task<bool> DeleteDesignationAsync(int id);
    Task<bool> UpdateDesignationStatusAsync(int id, UpdateDesignationStatusDto dto);
    Task<List<DesignationEmployeeDto>> GetEmployeesByDesignationAsync(int id);
}
