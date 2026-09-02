using EmpManagementAPI2.DTOs.Designation;

namespace EmpManagementAPI2.Interfaces;

public interface IDesignationService
{
    Task<bool> CreateDesignationAsync(CreateDesignationDto dto);
    Task<IEnumerable<DesignationListItemDto>> GetAllDesignationsAsync();
}