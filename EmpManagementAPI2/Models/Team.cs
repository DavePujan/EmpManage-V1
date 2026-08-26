namespace EmpManagementAPI2.Models;

public class Team
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public Department Department { get; set; } = null!;

    public int? TeamHeadEmployeeId { get; set; }

    public Employee? TeamHeadEmployee { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}