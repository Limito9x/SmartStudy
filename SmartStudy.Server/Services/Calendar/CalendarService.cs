using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Exceptions;

namespace SmartStudy.Server.Services;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetCalendarAsync(DateOnly fromDate, DateOnly toDate);
    Task<List<UnscheduledItemDto>> GetUnscheduledItemsAsync();
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
                 && t.TaskDate >= fromDate
                 && t.TaskDate <= toDate)
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
            Date = task.TaskDate!.Value,
            StartTime = task.StartTime,
            Duration = task.PlannedDuration,
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

public async Task<List<UnscheduledItemDto>> GetUnscheduledItemsAsync()
{
    var userId = _currentUserService.UserId;
    var unscheduledList = new List<UnscheduledItemDto>();
    var unscheduledTasks = await _context.Tasks
        .Where(t => t.UserId == userId
                    && !t.TaskDate.HasValue).ToListAsync();
    
    unscheduledList.AddRange(_mapper.Map<List<UnscheduledItemDto>>(unscheduledTasks));

    var unscheduledRoutines = await _context.Routines
        .Where(r => r.UserId == userId
                 && !r.Schedules.Any()).ToListAsync();
    
    unscheduledList.AddRange(_mapper.Map<List<UnscheduledItemDto>>(unscheduledRoutines));

    return unscheduledList;
}
}