using System.Net;
using System.Text.Json;

namespace EmpManagementAPI2.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution.");

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            string json = JsonSerializer.Serialize(new
            {
                statusCode = context.Response.StatusCode,
                message = "An unexpected error occurred. Please contact support if the issue persists."
            });

            await context.Response.WriteAsync(json);
        }
    }
}
