namespace EmpManagementAPI2.DTOs.Leave;

public class LeaveFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public int? EmployeeId { get; set; }
    public int? TeamId { get; set; }
    public string? LeaveType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}
