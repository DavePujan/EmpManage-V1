using EmpManagementAPI2.DTOs.Designation;

namespace EmpManagementAPI2.Interfaces;

public interface IDesignationRepository
{
    Task<bool> CreateDesignationAsync(CreateDesignationDto dto);
}