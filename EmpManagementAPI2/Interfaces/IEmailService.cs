using EmpManagementAPI2.DTOs.Leave;

namespace EmpManagementAPI2.Interfaces;

public interface IEmailService
{
    Task SendEmployeeCredentialsAsync(
        string email,
        string username,
        string temporaryPassword);

    Task SendLeaveRequestNotificationAsync(
        LeaveResponseDto leave);

    Task SendLeaveApprovedEmailAsync(
        LeaveResponseDto leave);

    Task SendLeaveRejectedEmailAsync(
        LeaveResponseDto leave);
}