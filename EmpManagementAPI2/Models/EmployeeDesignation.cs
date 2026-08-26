namespace EmpManagementAPI2.Models;

public class EmployeeDesignation
{
    public int EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public int DesignationId { get; set; }

    public Designation Designation { get; set; } = null!;
}