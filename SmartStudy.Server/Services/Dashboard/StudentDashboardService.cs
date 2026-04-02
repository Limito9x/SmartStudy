using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services;

public interface IStudentDashboardService
{
    Task<DashboardSummaryDto> GetSummary();
}
public class StudentDashboardService: IStudentDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    
    public StudentDashboardService(ApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardSummaryDto> GetSummary()
{
    var userId = _currentUserService.UserId;
    var now = DateTime.UtcNow.AddHours(7);
    var today = now.Date;
    var dayOfWeek = (int)today.DayOfWeek;
// Chuyển Sunday(0) thành 7 để tính đúng
    var adjustedDay = dayOfWeek == 0 ? 7 : dayOfWeek;
    var startOfWeek = today.AddDays(-(adjustedDay - 1)); // Thứ 2
    var todayOnly = DateOnly.FromDateTime(today);
    var lastWeekStart = startOfWeek.AddDays(-7);

    // Logs tuần này và tuần trước — 1 query duy nhất
    var allLogs = await _context.Logs
        .Include(l => l.Task)
        .Where(l => l.Task.UserId == userId
                 && l.CreatedAt >= lastWeekStart
                 && l.CreatedAt < startOfWeek.AddDays(7))
        .ToListAsync();

    var thisWeekLogs = allLogs.Where(l => l.CreatedAt >= startOfWeek).ToList();
    var lastWeekLogs = allLogs.Where(l => l.CreatedAt < startOfWeek).ToList();

    // Tasks hôm nay
    var todayTasks = await _context.Tasks
        .Include(t => t.Course)
        .Where(t => t.UserId == userId
                 && t.StartDateTime.HasValue
                 && t.StartDateTime.Value.Date == today && t.Status!= Entities.Enums.TaskStatus.Completed)
        .ToListAsync();

    // Overdue
    var overdueTasks = await _context.Tasks
        .Include(t => t.Course)
        .Where(t => t.UserId == userId
                 && t.StartDateTime.HasValue
                 && t.StartDateTime.Value.Date < today
                 && t.Status != Entities.Enums.TaskStatus.Completed
                 && t.Status != Entities.Enums.TaskStatus.Cancelled)
        .ToListAsync();
    
    var completedTasks = await _context.Tasks
        .Where(t => t.UserId == userId
                 && t.StartDateTime.HasValue
                 && t.StatusUpdatedAt.HasValue
                 && t.StatusUpdatedAt.Value.Date == today
                 && t.Status == Entities.Enums.TaskStatus.Completed)
        .ToListAsync();

    // Tasks tuần này để tính completion rate
    var weekTasks = await _context.Tasks
        .Where(t => t.UserId == userId
                 && t.StartDateTime.HasValue
                 && t.StartDateTime.Value.Date >= startOfWeek
                 && t.StartDateTime.Value.Date <= startOfWeek.AddDays(6))
        .ToListAsync();

    // Current plan
    var currentPlan = await _context.StudyPlans
        .Where(p => p.UserId == userId && p.Status==StudyPlanStatus.Active)
        .OrderByDescending(p =>
            p.StartDate <= today && (p.EndDate == null || p.EndDate >= today) ? 1 : 0)
        .ThenByDescending(p => p.StartDate)
        .FirstOrDefaultAsync();

    // Tính KPI
    var hoursThisWeek = thisWeekLogs.Sum(l => l.ActualDuration) / 60.0;
    var hoursLastWeek = lastWeekLogs.Sum(l => l.ActualDuration) / 60.0;

    var productivityThisWeek = thisWeekLogs.Any()
        ? thisWeekLogs.Average(l => StatisticHelper.CalculateProductivity(l, l.Task))
        : 0;
    var productivityLastWeek = lastWeekLogs.Any()
        ? lastWeekLogs.Average(l => StatisticHelper.CalculateProductivity(l, l.Task))
        : 0;
    
    var hoursDelta = (hoursThisWeek > 0 && hoursLastWeek > 0)
        ? Math.Round(hoursThisWeek - hoursLastWeek, 1)
        : (double?)null;

    var productivityDelta = (productivityThisWeek > 0 && productivityLastWeek > 0)
        ? Math.Round(productivityThisWeek - productivityLastWeek, 1)
        : (double?)null;

    var completionRate = weekTasks.Any()
        ? (double)weekTasks.Count(t => t.Status == Entities.Enums.TaskStatus.Completed)
          / weekTasks.Count * 100
        : 0;
    
    var upcomingEvents = await _context.TimelineEvents
        .Include(e => e.Course)
        .Where(e => e.Course.StudyPlan.UserId == userId
                 && e.DueDate.HasValue
                 && e.DueDate.Value.Date > today
                 && e.DueDate.Value.Date <= today.AddDays(30))
        .ToListAsync();

    return new DashboardSummaryDto
    {
        WeeklyStudyHours      = Math.Round(hoursThisWeek, 1),
        WeeklyProductivity    = Math.Round(productivityThisWeek, 1),
        HoursDelta            = hoursDelta,
        ProductivityDelta     = productivityDelta,
        WeeklyCompletionRate  = Math.Round(completionRate, 1),
        DaysLeftInPlan        = currentPlan?.EndDate.HasValue == true
                                ? (int)(currentPlan.EndDate.Value - today).TotalDays
                                : null,
        CurrentPlanName       = currentPlan?.Name,
        TodayTasks            = todayTasks.Select(t => t.Adapt<TodayTaskDto>()).ToList(),
        OverdueTasks          = overdueTasks.Select(t => t.Adapt<TodayTaskDto>()).ToList(),
        CompletedTasks = completedTasks.Select(t => t.Adapt<TodayTaskDto>()).ToList(),
        UpcomingEvents = upcomingEvents.Select(e => {
            var dto = e.Adapt<UpcomingEventDto>();
            dto.DaysUntil = e.DueDate.HasValue 
                ? (int)(e.DueDate.Value.Date - today).TotalDays 
                : 0;
            dto.CourseName = e.Course?.Name ?? "";
            return dto;
        }).ToList()
    };
}
}