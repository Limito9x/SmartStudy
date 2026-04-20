using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Exceptions;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetCalendarAsync(DateOnly fromDate, DateOnly toDate);
    Task<List<CalendarEventDto>> GetCalendarAsync(int userId, DateOnly fromDate, DateOnly toDate);
    Task<InboxResponseDto> GetInboxItemsAsync();
    Task RescheduleTaskAsync(RescheduleTaskDto dto);
}

public class CalendarService: ICalendarService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    
    public CalendarService(ApplicationDbContext context,  ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
    
    public async Task<List<CalendarEventDto>> GetCalendarAsync(
    DateOnly fromDate, DateOnly toDate)
{
    var userId = _currentUserService.UserId;
    return await GetCalendarAsync(userId, fromDate, toDate);
}

public async Task<List<CalendarEventDto>> GetCalendarAsync(
    int userId, DateOnly fromDate, DateOnly toDate)
{
    if (fromDate > toDate)
        throw new AppException("fromDate không được lớn hơn toDate.");

    var fromDateTime = fromDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
    var toDateTime = toDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
    var result = new List<CalendarEventDto>();

    // 1. Tasks thật có TaskDate trong khoảng
    var tasks = await _context.Tasks
        .Include(t => t.Phase)
        .ThenInclude(p => p!.Course)
        .Include(t => t.Routine)
        .Where(t => t.UserId == userId
                 && t.StartDateTime.HasValue
                 && t.StartDateTime.Value.Date >= fromDate.ToDateTime(TimeOnly.MinValue)
                 && t.StartDateTime.Value.Date <= toDate.ToDateTime(TimeOnly.MaxValue)
                 && t.Status!= TaskStatus.Archived)
        .ToListAsync();

    // Task IDs đã có thật — để lọc trùng với occurrence
    var materializedRoutineOccurrences = tasks
        .Where(t => t.RoutineId.HasValue && t.ScheduleId.HasValue)
        .Select(t => (t.RoutineId!.Value, t.ScheduleId!.Value))
        .ToHashSet();

    foreach (var task in tasks)
    {
        var startAt = task.StartDateTime ?? DateTime.UtcNow;
        var course = task.Phase?.Course;
        result.Add(new CalendarEventDto
        {
            CalendarId = $"task-{task.Id}",
            EntityId = task.Id,
            EntityType = CalendarEntityType.Task,
            Title = task.Name,
            StartAt = startAt,
            EndAt = task.EndDateTime ?? startAt,
            CourseName = course?.Name,
            Location = task.Location,
            RoutineId = task.RoutineId,
            CourseId = task.Phase?.CourseId,
            TaskType = task.Type,
            Status = task.Status.ToString(),
            IsOverdue = task.IsOverdue,
            IsVirtual = false,
            Color = course?.Color ?? "#7F77DD"
        });
    }

    // 2. Routine occurrences — render ảo, bỏ qua cái đã có task thật
    var routines = await _context.Routines
        .Include(r => r.Schedules)
        .Include(r => r.Phase)
        .ThenInclude(p => p!.Course)
        .Where(r => r.UserId == userId 
                    && r.IsActive
                    && r.Phase != null
                    && r.Phase.Course != null
                    && r.Phase.Course.Status == CourseStatus.Enrolled
                    && r.StartDate <= toDateTime
                    && (r.EndDate == null || r.EndDate >= fromDateTime))
        .ToListAsync();

    for (var date = fromDate; date <= toDate; date = date.AddDays(1))
    {
        foreach (var routine in routines)
        {
            foreach (var schedule in routine.Schedules)
            {
                if (schedule.DayOfWeek != date.DayOfWeek) continue;
                if (!schedule.StartTime.HasValue || !schedule.Duration.HasValue) continue;

                // Đã có task thật cho occurrence này → bỏ qua
                if (materializedRoutineOccurrences
                    .Contains((routine.Id, schedule.Id))) continue;

                DateTime start = date.ToDateTime(schedule.StartTime.Value);
                DateTime end = start.AddMinutes(schedule.Duration.Value);

                result.Add(new CalendarEventDto
                {
                    CalendarId = $"schedule-{schedule.Id}-{date:yyyyMMdd}",
                    EntityId = schedule.Id,
                    EntityType = CalendarEntityType.Task,
                    RoutineId = routine.Id,
                    Title = routine.Name,
                    StartAt = start,
                    EndAt = end,
                    Location = schedule.Location,
                    CourseName = routine.Phase?.Course?.Name,
                    CourseId = routine.Phase?.CourseId,
                    IsVirtual = true,  // chưa có task thật
                    Status = "Pending",
                    Color = routine.Phase?.Course?.Color ?? "#7F77DD"
                });
            }
        }
    }

    return result.OrderBy(e => e.StartAt)
                 .ThenBy(e => TimeOnly.FromDateTime(e.StartAt))
                 .ToList();
}

public async Task<InboxResponseDto> GetInboxItemsAsync()
{
    var userId = _currentUserService.UserId;
    var floatingTasks = await _context.Tasks
        .Include(t => t.Phase)
        .ThenInclude(p => p!.Course)
        .AsNoTracking()
        .Where(t => t.UserId == userId
                    && t.RoutineId == null
                    && !t.StartDateTime.HasValue
                    && (t.Phase == null
                        || t.Phase.Course == null
                        || t.Phase.Course.Status == CourseStatus.Enrolled)
                    && t.Status != TaskStatus.Cancelled
                    && t.Status != TaskStatus.Archived)
        .ToListAsync();

    var fixedRoutines = await _context.Routines
        .Include(r => r.Phase)
        .ThenInclude(p => p!.Course)
        .AsNoTracking()
        .Where(r => r.UserId == userId
                    && (r.Phase == null
                        || r.Phase.Course == null
                        || r.Phase.Course.Status == CourseStatus.Enrolled))
        .ToListAsync();

    var floatingItems = floatingTasks.Select(t => new UnscheduledItemDto
    {
        Id = t.Id,
        EntityType = CalendarEntityType.Task,
        Name = t.Name,
        Description = t.Description,
        Type = t.Type,
        CourseId = t.Phase?.CourseId,
        CourseName = t.Phase?.Course?.Name,
        CourseColor = t.Phase?.Course?.Color,
        StudyPlanId = t.StudyPlanId ?? 0,
        PlannedDuration = t.StartDateTime.HasValue && t.EndDateTime.HasValue
            ? Math.Max(0, (int)(t.EndDateTime.Value - t.StartDateTime.Value).TotalMinutes)
            : 0,
    }).ToList();

    var routineItems = fixedRoutines.Select(r => new UnscheduledItemDto
    {
        Id = r.Id,
        EntityType = CalendarEntityType.Routine,
        Name = r.Name,
        Description = r.Description,
        Type = r.Type,
        CourseId = r.Phase?.CourseId,
        CourseName = r.Phase?.Course?.Name,
        CourseColor = r.Phase?.Course?.Color,
        StudyPlanId = r.StudyPlanId ?? 0,
        PlannedDuration = r.Schedules
            .Where(s => s.Duration.HasValue)
            .Sum(s => s.Duration ?? 0),
    }).ToList();

    return new InboxResponseDto
    {
        FloatingTasks = floatingItems,
        FixedRoutines = routineItems,
    };
}

public async Task RescheduleTaskAsync(RescheduleTaskDto dto)
{
    var userId = _currentUserService.UserId;
    var task = await _context.Tasks
        .Where(t => t.UserId == userId && t.Id == dto.TaskId)
        .FirstOrDefaultAsync();

    if (task == null)
        throw new KeyNotFoundException("Task không tồn tại!");

    task.StartDateTime=dto.newStartDate;
    task.EndDateTime=dto.newEndDate;

    await _context.SaveChangesAsync();
}
}