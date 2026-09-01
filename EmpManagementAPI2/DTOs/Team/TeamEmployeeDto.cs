namespace EmpManagementAPI2.DTOs.Team;

public class TeamEmployeeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}