namespace EmpManagementAPI2.DTOs.Department;

public class DepartmentListDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int TotalEmployees { get; set; }

    public int TotalTeams { get; set; }

    public bool IsActive { get; set; }
}