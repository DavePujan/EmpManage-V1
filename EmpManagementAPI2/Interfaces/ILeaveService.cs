using EmpManagementAPI2.DTOs.Leave;

namespace EmpManagementAPI2.Interfaces;

public interface ILeaveService
{
    Task<LeaveResponseDto?> CreateLeaveAsync(
        int employeeId,
        CreateLeaveRequestDto dto);

    Task<List<LeaveResponseDto>> GetMyLeavesAsync(
        int employeeId);

    Task<LeaveResponseDto?> GetLeaveByIdAsync(
        int leaveId);

    Task<List<LeaveResponseDto>> GetAllLeavesAsync();

    Task<List<LeaveResponseDto>> GetPendingLeavesAsync();

    Task<List<LeaveResponseDto>> GetTeamLeavesAsync(
        int employeeId);

    Task<bool> ApproveLeaveAsync(
        int leaveId,
        int approvedBy);

    Task<bool> RejectLeaveAsync(
        int leaveId,
        int rejectedBy,
        string? reason);

    Task<int?> GetEmployeeIdByAppUserIdAsync(
        int appUserId);
}