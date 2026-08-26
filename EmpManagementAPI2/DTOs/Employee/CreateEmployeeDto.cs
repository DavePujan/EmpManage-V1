namespace EmpManagementAPI2.DTOs.Employee;

public class CreateEmployeeDto
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public int? DepartmentId { get; set; }

    public int? TeamId { get; set; }

    public int? SupervisorId { get; set; }

    public int DesignationId { get; set; }
}