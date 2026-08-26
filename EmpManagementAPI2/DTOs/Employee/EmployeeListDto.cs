namespace EmpManagementAPI2.DTOs.Employee;

public class EmployeeListDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Team { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public string Supervisor { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}