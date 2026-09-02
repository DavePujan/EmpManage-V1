using System.Net;
using System.Net.Mail;
using EmpManagementAPI2.Data;
using EmpManagementAPI2.DTOs.Leave;
using EmpManagementAPI2.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmpManagementAPI2.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    public EmailService(
        IConfiguration configuration,
        AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    // =========================================================
    // EMPLOYEE CREDENTIALS
    // =========================================================

    public async Task SendEmployeeCredentialsAsync(
        string email,
        string username,
        string temporaryPassword)
    {
        var subject = "Employee Management System - Your Account";

        var body = $"""
            <h2>Welcome to Employee Management System</h2>

            <p>Your employee account has been created.</p>

            <p><strong>Username:</strong> {username}</p>

            <p>
                <strong>Temporary Password:</strong>
                {temporaryPassword}
            </p>

            <p>Please use these credentials to log in.</p>

            <p>
                Regards,<br/>
                Employee Management System
            </p>
            """;

        await SendEmailAsync(
            email,
            subject,
            body);
    }


    // =========================================================
    // NEW LEAVE REQUEST → HR
    // =========================================================

    public async Task SendLeaveRequestNotificationAsync(
        LeaveResponseDto leave)
    {
        var hrEmails = await _context.UserRoles
            .Where(ur =>
                ur.Role.Name == "HR" &&
                ur.User.IsActive)
            .Select(ur => ur.User.Email)
            .Where(email => email != null)
            .Distinct()
            .ToListAsync();

        if (!hrEmails.Any())
        {
            return;
        }

        var subject = "New Leave Request";

        var body = $"""
            <h2>New Leave Request</h2>

            <p>A new leave request has been submitted.</p>

            <p>
                <strong>Employee:</strong>
                {leave.EmployeeName}
            </p>

            <p>
                <strong>Leave Type:</strong>
                {leave.LeaveType}
            </p>

            <p>
                <strong>Start Date:</strong>
                {leave.StartDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>End Date:</strong>
                {leave.EndDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>Reason:</strong>
                {leave.Reason}
            </p>

            <p>
                <strong>Status:</strong>
                Pending
            </p>

            <p>
                Please log in to the Employee Management System
                to review the request.
            </p>
            """;

        foreach (var hrEmail in hrEmails)
        {
            if (!string.IsNullOrWhiteSpace(hrEmail))
            {
                await SendEmailAsync(
                    hrEmail,
                    subject,
                    body);
            }
        }
    }


    // =========================================================
    // LEAVE APPROVED → EMPLOYEE
    // =========================================================

    public async Task SendLeaveApprovedEmailAsync(
        LeaveResponseDto leave)
    {
        var employeeEmail = await GetEmployeeEmailAsync(
            leave.EmployeeId);

        if (string.IsNullOrWhiteSpace(employeeEmail))
        {
            return;
        }

        var subject = "Leave Request Approved";

        var body = $"""
            <h2>Leave Request Approved</h2>

            <p>Hello {leave.EmployeeName},</p>

            <p>
                Your leave request has been
                <strong>approved</strong>.
            </p>

            <p>
                <strong>Leave Type:</strong>
                {leave.LeaveType}
            </p>

            <p>
                <strong>Start Date:</strong>
                {leave.StartDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>End Date:</strong>
                {leave.EndDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>Approved By:</strong>
                {leave.ApprovedByName}
            </p>

            <p>
                Regards,<br/>
                Employee Management System
            </p>
            """;

        await SendEmailAsync(
            employeeEmail,
            subject,
            body);
    }


    // =========================================================
    // LEAVE REJECTED → EMPLOYEE
    // =========================================================

    public async Task SendLeaveRejectedEmailAsync(
        LeaveResponseDto leave)
    {
        var employeeEmail = await GetEmployeeEmailAsync(
            leave.EmployeeId);

        if (string.IsNullOrWhiteSpace(employeeEmail))
        {
            return;
        }

        var subject = "Leave Request Rejected";

        var body = $"""
            <h2>Leave Request Rejected</h2>

            <p>Hello {leave.EmployeeName},</p>

            <p>
                Your leave request has been
                <strong>rejected</strong>.
            </p>

            <p>
                <strong>Leave Type:</strong>
                {leave.LeaveType}
            </p>

            <p>
                <strong>Start Date:</strong>
                {leave.StartDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>End Date:</strong>
                {leave.EndDate:dd-MM-yyyy}
            </p>

            <p>
                <strong>Reason:</strong>
                {leave.Reason}
            </p>

            <p>
                Please contact HR if you have any questions.
            </p>

            <p>
                Regards,<br/>
                Employee Management System
            </p>
            """;

        await SendEmailAsync(
            employeeEmail,
            subject,
            body);
    }


    // =========================================================
    // GET EMPLOYEE EMAIL
    // =========================================================

    private async Task<string?> GetEmployeeEmailAsync(
        int employeeId)
    {
        return await _context.Employees
            .Where(e => e.Id == employeeId)
            .Select(e => e.Email)
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // COMMON EMAIL METHOD
    // =========================================================

    private async Task SendEmailAsync(
        string receiverEmail,
        string subject,
        string body)
    {
        var emailSettings =
            _configuration.GetSection("EmailSettings");

        var smtpServer =
            emailSettings["SmtpServer"];

        var port =
            int.Parse(emailSettings["Port"]!);

        var senderEmail =
            emailSettings["SenderEmail"];

        var username =
            emailSettings["Username"];

        var password =
            emailSettings["Password"];

        var senderName =
            emailSettings["SenderName"];

        using var message = new MailMessage();

        message.From = new MailAddress(
            senderEmail!,
            senderName);

        message.To.Add(receiverEmail);

        message.Subject = subject;

        message.Body = body;

        message.IsBodyHtml = true;

        try
        {
            using var smtpClient = new SmtpClient(
                smtpServer,
                port);

            smtpClient.EnableSsl = true;

            smtpClient.Credentials =
                new NetworkCredential(
                    username,
                    password);

            await smtpClient.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            // Log warning and allow the business transaction to succeed during development
            Console.WriteLine($"[EmailService Warning] Failed to send email to {receiverEmail}: {ex.Message}");
        }
    }
}