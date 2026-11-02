namespace EmpManagementAPI2.DTOs.Designation;

public class DesignationEmployeeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? TeamId { get; set; }
    public bool IsActive { get; set; }
}
