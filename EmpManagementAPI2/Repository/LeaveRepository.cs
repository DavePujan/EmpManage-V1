using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Leave;
using EmpManagementAPI2.Interfaces;
using EmpManagementAPI2.Models;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Repository;

public class LeaveRepository : ILeaveRepository
{
    private readonly AppDbContext _context;

    public LeaveRepository(AppDbContext context)
    {
        _context = context;
    }

    // CREATE LEAVE
    public async Task<LeaveResponseDto?> CreateLeaveAsync(
        int employeeId,
        CreateLeaveRequestDto dto)
    {
        var employee = await _context.Employees
            .Include(e => e.AppUser)
            .Include(e => e.Team)
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null)
        {
            return null;
        }

        if (dto.IsTeamLeave && dto.TeamId == null)
        {
            return null;
        }

        var leave = new LeaveRequest
        {
            EmployeeId = employeeId,
            LeaveType = dto.LeaveType,
            Reason = dto.Reason,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = "Pending",
            IsTeamLeave = dto.IsTeamLeave,
            TeamId = dto.TeamId,
            CreatedAt = DateTime.UtcNow
        };

        _context.LeaveRequests.Add(leave);

        await _context.SaveChangesAsync();

        return await GetLeaveByIdAsync(leave.Id);
    }

    // GET MY LEAVES
    public async Task<List<LeaveResponseDto>> GetMyLeavesAsync(
        int employeeId)
    {
        return await _context.LeaveRequests
            .Where(l => l.EmployeeId == employeeId)
            .Include(l => l.Employee)
            .Include(l => l.Team)
            .Include(l => l.ApprovedByEmployee)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.Name,
                LeaveType = l.LeaveType,
                Reason = l.Reason,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status,
                IsTeamLeave = l.IsTeamLeave,
                TeamId = l.TeamId,
                TeamName = l.Team != null
                    ? l.Team.Name
                    : "",
                ApprovedBy = l.ApprovedBy,
                ApprovedByName = l.ApprovedByEmployee != null
                    ? l.ApprovedByEmployee.Name
                    : "",
                ApprovedDate = l.ApprovedDate,
                CreatedAt = l.CreatedAt
            })
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    // GET LEAVE BY ID
    public async Task<LeaveResponseDto?> GetLeaveByIdAsync(
        int leaveId)
    {
        return await _context.LeaveRequests
            .Where(l => l.Id == leaveId)
            .Include(l => l.Employee)
            .Include(l => l.Team)
            .Include(l => l.ApprovedByEmployee)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.Name,
                LeaveType = l.LeaveType,
                Reason = l.Reason,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status,
                IsTeamLeave = l.IsTeamLeave,
                TeamId = l.TeamId,
                TeamName = l.Team != null
                    ? l.Team.Name
                    : "",
                ApprovedBy = l.ApprovedBy,
                ApprovedByName = l.ApprovedByEmployee != null
                    ? l.ApprovedByEmployee.Name
                    : "",
                ApprovedDate = l.ApprovedDate,
                CreatedAt = l.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    // GET ALL LEAVES
    public async Task<List<LeaveResponseDto>> GetAllLeavesAsync()
    {
        return await _context.LeaveRequests
            .Include(l => l.Employee)
            .Include(l => l.Team)
            .Include(l => l.ApprovedByEmployee)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.Name,
                LeaveType = l.LeaveType,
                Reason = l.Reason,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status,
                IsTeamLeave = l.IsTeamLeave,
                TeamId = l.TeamId,
                TeamName = l.Team != null
                    ? l.Team.Name
                    : "",
                ApprovedBy = l.ApprovedBy,
                ApprovedByName = l.ApprovedByEmployee != null
                    ? l.ApprovedByEmployee.Name
                    : "",
                ApprovedDate = l.ApprovedDate,
                CreatedAt = l.CreatedAt
            })
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    // GET PENDING LEAVES
    public async Task<List<LeaveResponseDto>> GetPendingLeavesAsync()
    {
        return await _context.LeaveRequests
            .Where(l => l.Status == "Pending")
            .Include(l => l.Employee)
            .Include(l => l.Team)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.Name,
                LeaveType = l.LeaveType,
                Reason = l.Reason,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status,
                IsTeamLeave = l.IsTeamLeave,
                TeamId = l.TeamId,
                TeamName = l.Team != null
                    ? l.Team.Name
                    : "",
                ApprovedBy = null,
                ApprovedByName = "",
                ApprovedDate = null,
                CreatedAt = l.CreatedAt
            })
            .OrderBy(l => l.StartDate)
            .ToListAsync();
    }

    // GET TEAM LEAVES
    public async Task<List<LeaveResponseDto>> GetTeamLeavesAsync(
        int employeeId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null || employee.TeamId == null)
        {
            return new List<LeaveResponseDto>();
        }

        return await _context.LeaveRequests
            .Where(l => l.TeamId == employee.TeamId)
            .Include(l => l.Employee)
            .Include(l => l.Team)
            .Include(l => l.ApprovedByEmployee)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.Name,
                LeaveType = l.LeaveType,
                Reason = l.Reason,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status,
                IsTeamLeave = l.IsTeamLeave,
                TeamId = l.TeamId,
                TeamName = l.Team != null
                    ? l.Team.Name
                    : "",
                ApprovedBy = l.ApprovedBy,
                ApprovedByName = l.ApprovedByEmployee != null
                    ? l.ApprovedByEmployee.Name
                    : "",
                ApprovedDate = l.ApprovedDate,
                CreatedAt = l.CreatedAt
            })
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    // APPROVE LEAVE
    public async Task<bool> ApproveLeaveAsync(
        int leaveId,
        int approvedBy)
    {
        var leave = await _context.LeaveRequests
            .FirstOrDefaultAsync(l => l.Id == leaveId);

        if (leave == null)
        {
            return false;
        }

        if (leave.Status != "Pending")
        {
            return false;
        }

        leave.Status = "Approved";
        leave.ApprovedBy = approvedBy;
        leave.ApprovedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    // REJECT LEAVE
    public async Task<bool> RejectLeaveAsync(
        int leaveId,
        int rejectedBy,
        string? reason)
    {
        var leave = await _context.LeaveRequests
            .FirstOrDefaultAsync(l => l.Id == leaveId);

        if (leave == null)
        {
            return false;
        }

        if (leave.Status != "Pending")
        {
            return false;
        }

        leave.Status = "Rejected";
        leave.ApprovedBy = rejectedBy;
        leave.ApprovedDate = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(reason))
        {
            leave.Reason = $"{leave.Reason} | HR: {reason}";
        }

        await _context.SaveChangesAsync();

        return true;
    }
    // GET EMPLOYEE ID FROM APP USER ID
    public async Task<int?> GetEmployeeIdByAppUserIdAsync(
        int appUserId)
    {
        return await _context.Employees
            .Where(e => e.AppUserId == appUserId)
            .Select(e => (int?)e.Id)
            .FirstOrDefaultAsync();
    }


    // CANCEL LEAVE
    public async Task<bool> CancelLeaveAsync(
        int leaveId,
        int userId)
    {
        var leave = await _context.LeaveRequests
            .Include(l => l.Employee)
            .FirstOrDefaultAsync(l => l.Id == leaveId);

        if (leave == null)
        {
            return false;
        }

        // Make sure this leave belongs to the logged-in employee
        if (leave.Employee.AppUserId != userId)
        {
            return false;
        }

        // Only pending leave can be cancelled
        if (leave.Status != "Pending")
        {
            return false;
        }

        // Change status
        leave.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return true;
    }
}