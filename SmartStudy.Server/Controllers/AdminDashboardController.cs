using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _adminDashboardService;

    public AdminDashboardController(IAdminDashboardService adminDashboardService)
    {
        _adminDashboardService = adminDashboardService;
    }

    [HttpGet("kpi", Name = "GetKPI")]
    public async Task<ActionResult<KpiSummaryDto>> GetKpi()
    {
        var result = await _adminDashboardService.GetKpiSummaryAsync();
        return Ok(result);
    }

    [HttpGet("charts/user-growth", Name = "GetUserGrowth")]
    public async Task<ActionResult<List<UserGrowthChartDto>>> GetUserGrowthChart([FromQuery] int days = 30)
    {
        var result = await _adminDashboardService.GetUserGrowthChartAsync(days);
        return Ok(result);
    }

    [HttpGet("charts/behavior", Name = "GetBehavior")]
    public async Task<ActionResult<List<BehaviorChartDto>>> GetBehaviorChart()
    {
        var result = await _adminDashboardService.GetBehaviorChartAsync();
        return Ok(result);
    }

    [HttpGet("users", Name = "GetUsers")]
    public async Task<ActionResult<PagedResult<UserAdminDto>>> GetUsers([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _adminDashboardService.GetUsersForAdminAsync(pageIndex, pageSize);
        return Ok(result);
    }

    [HttpPatch("users/{id:int}/toggle-status",Name = "ToggleUserStatus")]
    public async Task<ActionResult> ToggleUserStatus([FromRoute] int id)
    {
        var isActive = await _adminDashboardService.ToggleUserStatusAsync(id);
        return Ok(new { isActive });
    }
}
