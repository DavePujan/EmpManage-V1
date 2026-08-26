namespace EmpManagementAPI2.Models;

public class Employee
{
    public int Id { get; set; }

    public int AppUserId { get; set; }

    public AppUser AppUser { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int? DepartmentId { get; set; }

    public Department? Department { get; set; }

    public int? TeamId { get; set; }

    public Team? Team { get; set; }

    public int? SupervisorId { get; set; }

    public Employee? Supervisor { get; set; }

    public DateTime JoiningDate { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Employee> Subordinates { get; set; }
        = new List<Employee>();

    public ICollection<EmployeeDesignation> EmployeeDesignations { get; set; }
        = new List<EmployeeDesignation>();

    public ICollection<LeaveRequest> LeaveRequests { get; set; }
        = new List<LeaveRequest>();
}