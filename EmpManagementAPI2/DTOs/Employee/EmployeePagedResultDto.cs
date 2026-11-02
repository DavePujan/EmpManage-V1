namespace EmpManagementAPI2.DTOs.Employee;

public class EmployeePagedResultDto
{
    public List<EmployeeListDto> Employees { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalRecords { get; set; }
    public int TotalPages { get; set; }
}
