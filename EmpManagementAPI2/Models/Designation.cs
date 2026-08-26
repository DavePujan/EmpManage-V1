namespace EmpManagementAPI2.Models;

public class Designation
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<EmployeeDesignation> EmployeeDesignations { get; set; }
        = new List<EmployeeDesignation>();
}