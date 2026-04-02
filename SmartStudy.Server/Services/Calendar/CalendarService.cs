using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Exceptions;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetCalendarAsync(DateOnly fromDate, DateOnly toDate);
    Task<InboxResponseDto> GetInboxItemsAsync();
    Task RescheduleTaskAsync(RescheduleTaskDto dto);
}

public class CalendarService: ICalendarService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    
    public CalendarService(ApplicationDbContext context,  ICurrentUserService currentUserService,  IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }
    
            public async Task<List<CalendarEventDto>> GetCalendarAsync(
    DateOnly fromDate, DateOnly toDate)
{
    if (fromDate > toDate)
        throw new AppException("fromDate không được lớn hơn toDate.");

    var userId = _currentUserService.UserId;
    var fromDateTime = fromDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
    var toDateTime = toDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
    var result = new List<CalendarEventDto>();

    // 1. Tasks thật có TaskDate trong khoảng
    var tasks = await _context.Tasks
        .Include(t => t.Course)
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
        result.Add(new CalendarEventDto
        {
            CalendarId = $"task-{task.Id}",
            EntityId = task.Id,
            EntityType = CalendarEntityType.Task,
            Title = task.Name,
            Date = DateOnly.FromDateTime(task.StartDateTime!.Value),
            StartTime = TimeOnly.FromDateTime(task.StartDateTime!.Value),
            Duration = task.EndDateTime.HasValue && task.StartDateTime.HasValue ? (int?)(task.EndDateTime.Value - task.StartDateTime.Value).TotalMinutes : null,
            CourseName = task.Course?.Name,
            CourseId = task.CourseId,
            TaskType = task.Type,
            Status = task.Status,
            IsVirtual = false,
            Color = task.Course?.Color ?? "#7F77DD"
        });
    }

    // 2. Routine occurrences — render ảo, bỏ qua cái đã có task thật
    var routines = await _context.Routines
        .Include(r => r.Schedules)
        .Include(r => r.Course)
        .Where(r => r.UserId == userId 
                    && r.Course.Status == CourseStatus.Enrolled
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

                // Đã có task thật cho occurrence này → bỏ qua
                if (materializedRoutineOccurrences
                    .Contains((routine.Id, schedule.Id))) continue;

                result.Add(new CalendarEventDto
                {
                    CalendarId = $"schedule-{schedule.Id}-{date:yyyyMMdd}",
                    EntityId = schedule.Id,
                    EntityType = CalendarEntityType.Schedule,
                    RoutineId = routine.Id,
                    Title = routine.Name,
                    Date = date,
                    StartTime = schedule.StartTime,
                    Duration = schedule.Duration,
                    CourseName = routine.Course?.Name,
                    CourseId = routine.CourseId,
                    IsVirtual = true,  // chưa có task thật
                    Color = routine.Course?.Color ?? "#7F77DD"
                });
            }
        }
    }

    // 3. Timeline events
    var events = await _context.TimelineEvents
        .Include(e => e.Course)
        .Where(e => e.Course.StudyPlan.UserId == userId
                 && e.DueDate.HasValue
                 && e.DueDate.Value.Date >= fromDate.ToDateTime(TimeOnly.MinValue)
                 && e.DueDate.Value.Date <= toDate.ToDateTime(TimeOnly.MaxValue))
        .ToListAsync();

    foreach (var ev in events)
    {
        result.Add(new CalendarEventDto
        {
            CalendarId = $"event-{ev.Id}",
            EntityId = ev.Id,
            EntityType = CalendarEntityType.TimelineEvent,
            Title = ev.Title,
            Date = DateOnly.FromDateTime(ev.DueDate!.Value),
            CourseName = ev.Course?.Name,
            CourseId = ev.CourseId,
            Priority = ev.Priority,
            IsVirtual = false,
            Color = ev.Course?.Color ?? "#7F77DD"
        });
    }

    return result.OrderBy(e => e.Date)
                 .ThenBy(e => e.StartTime)
                 .ToList();
}

public async Task<InboxResponseDto> GetInboxItemsAsync()
{
    var userId = _currentUserService.UserId;
    var floatingTasks = await _context.Tasks
        .Include(t=>t.Course)
        .AsNoTracking()
        .Where(t => t.UserId == userId
                    && t.RoutineId == null
                    && !t.StartDateTime.HasValue
                    && t.Status != TaskStatus.Cancelled
                    && t.Status != TaskStatus.Archived)
        .ToListAsync();

    var fixedRoutines = await _context.Routines
        .Include(r => r.Course)
        .AsNoTracking()
        .Where(r => r.UserId == userId)
        .ToListAsync();

    return new InboxResponseDto
    {
        FloatingTasks = _mapper.Map<List<UnscheduledItemDto>>(floatingTasks),
        FixedRoutines = _mapper.Map<List<UnscheduledItemDto>>(fixedRoutines)
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

    var startDateTime = dto.NewDate.ToDateTime(dto.NewStartTime);
    task.StartDateTime = startDateTime;
    task.EndDateTime = startDateTime.AddMinutes(dto.NewDuration);

    await _context.SaveChangesAsync();
}
}