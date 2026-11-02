namespace EmpManagementAPI2.DTOs.Employee;

public class EmployeeFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public int? DepartmentId { get; set; }
    public int? TeamId { get; set; }
    public int? DesignationId { get; set; }
    public int? SupervisorId { get; set; }
    public string SortBy { get; set; } = "name";
    public bool SortDescending { get; set; } = false;
}
