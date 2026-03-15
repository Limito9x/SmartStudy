using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController: ControllerBase
{
    private readonly IStudentDashboardService _dashboardService;
    public DashboardController(IStudentDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("/students/summary", Name = "GetStudentDashboardSummary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetStudentDashboardSummary()
    {
        var summary = await _dashboardService.GetSummary();
        return Ok(summary);
    }
}