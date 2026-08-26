namespace EmpManagementAPI2.Models;

public class Department
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<Team> Teams { get; set; } = new List<Team>();

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}