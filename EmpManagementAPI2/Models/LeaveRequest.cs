using EmpManagementAPI2.Models;

public class LeaveRequest
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public string LeaveType { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Status { get; set; } = "Pending";

    public bool IsTeamLeave { get; set; } = false;

    public int? TeamId { get; set; }

    public Team? Team { get; set; }

    public int? ApprovedBy { get; set; }

    public Employee? ApprovedByEmployee { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}