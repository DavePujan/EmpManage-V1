namespace EmpManagementAPI2.DTOs.Employee;

public class UpdateEmployeeDto
{
    public string Email { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int? DepartmentId { get; set; }

    public int? TeamId { get; set; }

    public int? SupervisorId { get; set; }

    public int DesignationId { get; set; }
}