namespace EmpManagementAPI2.DTOs.Team;

public class TeamDetailsDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public string Department { get; set; } = string.Empty;

    public int? TeamHeadEmployeeId { get; set; }

    public string TeamHead { get; set; } = string.Empty;

    public int EmployeeCount { get; set; }

    public bool IsActive { get; set; }
}