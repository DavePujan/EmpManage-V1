namespace EmpManagementAPI2.DTOs.Leave;

public class LeavePagedResultDto
{
    public List<LeaveResponseDto> Leaves { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalRecords { get; set; }
    public int TotalPages { get; set; }
}
