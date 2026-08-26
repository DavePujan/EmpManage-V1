namespace EmpManagementAPI2.DTOs.Leave;

public class LeaveResponseDto
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string LeaveType { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsTeamLeave { get; set; }

    public int? TeamId { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public int? ApprovedBy { get; set; }

    public string ApprovedByName { get; set; } = string.Empty;

    public DateTime? ApprovedDate { get; set; }

    public DateTime CreatedAt { get; set; }
}