namespace EmpManagementAPI2.DTOs.Leave;

public class CreateLeaveRequestDto
{
    public string LeaveType { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsTeamLeave { get; set; } = false;

    public int? TeamId { get; set; }
}