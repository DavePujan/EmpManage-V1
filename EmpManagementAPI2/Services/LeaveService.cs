using EmpManagementAPI2.DTOs.Leave;
using EmpManagementAPI2.Interfaces;

namespace EmpManagementAPI2.Services;

public class LeaveService : ILeaveService
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmailService _emailService;

    public LeaveService(
        ILeaveRepository leaveRepository,
        IEmailService emailService)
    {
        _leaveRepository = leaveRepository;
        _emailService = emailService;
    }

    // Employee applies for leave
    public async Task<LeaveResponseDto?> CreateLeaveAsync(
        int employeeId,
        CreateLeaveRequestDto dto)
    {
        var leave = await _leaveRepository.CreateLeaveAsync(
            employeeId,
            dto);

        if (leave == null)
        {
            return null;
        }

        // Notify HR
        await _emailService.SendLeaveRequestNotificationAsync(leave);

        return leave;
    }

    // Employee views own leaves
    public async Task<List<LeaveResponseDto>> GetMyLeavesAsync(
        int employeeId)
    {
        return await _leaveRepository.GetMyLeavesAsync(employeeId);
    }

    // View one leave
    public async Task<LeaveResponseDto?> GetLeaveByIdAsync(
        int leaveId)
    {
        return await _leaveRepository.GetLeaveByIdAsync(leaveId);
    }

    // Manager / HR / Admin
    public async Task<List<LeaveResponseDto>> GetAllLeavesAsync()
    {
        return await _leaveRepository.GetAllLeavesAsync();
    }

    // Manager / HR / Admin
    public async Task<List<LeaveResponseDto>> GetPendingLeavesAsync()
    {
        return await _leaveRepository.GetPendingLeavesAsync();
    }

    // HR
    public async Task<List<LeaveResponseDto>> GetTeamLeavesAsync(
        int employeeId)
    {
        return await _leaveRepository.GetTeamLeavesAsync(employeeId);
    }

    // HR approves
    public async Task<bool> ApproveLeaveAsync(
        int leaveId,
        int approvedBy)
    {
        var result = await _leaveRepository.ApproveLeaveAsync(
            leaveId,
            approvedBy);

        if (!result)
        {
            return false;
        }

        var leave = await _leaveRepository.GetLeaveByIdAsync(leaveId);

        if (leave != null)
        {
            await _emailService.SendLeaveApprovedEmailAsync(leave);
        }

        return true;
    }

    // HR rejects
    public async Task<bool> RejectLeaveAsync(
        int leaveId,
        int rejectedBy,
        string? reason)
    {
        var result = await _leaveRepository.RejectLeaveAsync(
            leaveId,
            rejectedBy,
            reason);

        if (!result)
        {
            return false;
        }

        var leave = await _leaveRepository.GetLeaveByIdAsync(leaveId);

        if (leave != null)
        {
            await _emailService.SendLeaveRejectedEmailAsync(leave);
        }

        return true;
    }

    public async Task<int?> GetEmployeeIdByAppUserIdAsync(
    int appUserId)
    {
        return await _leaveRepository
            .GetEmployeeIdByAppUserIdAsync(appUserId);
    }

    // CANCEL LEAVE
    public async Task<bool> CancelLeaveAsync(
        int leaveId,
        int userId)
    {
        return await _leaveRepository
            .CancelLeaveAsync(leaveId, userId);
    }

    public async Task<LeavePagedResultDto> SearchLeavesAsync(LeaveFilterDto filter)
    {
        return await _leaveRepository.SearchLeavesAsync(filter);
    }
}