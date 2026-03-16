using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController: ControllerBase
{
    private readonly IStudentDashboardService _dashboardService;
    private readonly IChatService _chatService;
    public DashboardController(
        IStudentDashboardService dashboardService,
        IChatService chatService
        )
    {
        _dashboardService = dashboardService;
        _chatService = chatService;
    }

    [HttpGet("/students/summary", Name = "GetStudentDashboardSummary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetStudentDashboardSummary()
    {
        var summary = await _dashboardService.GetSummary();
        return Ok(summary);
    }

    [HttpGet("/students/insight", Name = "GetStudentDashboardInsight")]
    public async Task<ActionResult<string>> GetStudentDashboardInsight()
    {
        var summary = await _dashboardService.GetSummary();
        var insight = await _chatService.GetInsight(summary);
        return Ok(insight);
    }
}