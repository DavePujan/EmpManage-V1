namespace EmpManagementAPI2.DTOs.Team;

public class CreateTeamDto
{
    public string Name { get; set; } = string.Empty;

    public int DepartmentId { get; set; }
}