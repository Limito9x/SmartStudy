using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Hubs;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Jobs;

public interface IRoutineTaskGenerator
{
    Task GenerateForSingleRoutineAsync(int routineId);
    Task GenerateUpcomingTasksAsync();
}

public class RoutineTaskGenerator: IRoutineTaskGenerator
{
    private readonly ILogger<RoutineTaskGenerator> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    
    public RoutineTaskGenerator(ILogger<RoutineTaskGenerator> logger,
        ApplicationDbContext context,
        IHubContext<NotificationHub> hubContext)
    {
        _logger = logger;
        _context = context;
        _hubContext = hubContext;
    }

    public async Task GenerateForSingleRoutineAsync(int routineId)
    {
        _logger.LogInformation($"Bắt đầu sinh task cho routine ID:{routineId}");
        var routine = await _context.Routines
                    .Include(r=>r.Schedules)
                    .FirstOrDefaultAsync(r=>r.Id==routineId);

        if (routine != null)
        {
            var total = await ProcessSingleRoutineAsync(routine);
            _logger.LogInformation($"Tổng cộng sinh ra {total} tasks");
            await _context.SaveChangesAsync();
        }
        else _logger.LogInformation("Không tìm thấy routine để sinh task");
        _logger.LogInformation($"Kết thúc quá trình sinh task cho routine ID:{routineId}");
    }

    public async Task GenerateUpcomingTasksAsync()
    {
        _logger.LogInformation("Bắt đầu tiến trình sinh task tự động");
        var today = DateTime.Today.Date;
        var lookAheadDate = today.AddDays(14);

        var newTaskCount = 0;
        
        var activeRoutines = await _context.Routines
            .Include(r => r.Schedules)
            .Include(r => r.Phase)
            .ThenInclude(p => p.Course) // Include Khóa học qua phase để xét tư cách
            .Where(r => 
                r.IsActive == true && // Tư cách 1: Lịch đang bật
                r.Phase != null &&
                r.Phase.Course != null &&
                r.Phase.Course.Status == CourseStatus.Enrolled && // Tư cách 2: Môn học chưa chốt sổ
                r.StartDate <= lookAheadDate && 
                (r.EndDate == null || r.EndDate >= today))
            .ToListAsync();

        foreach (var routine in activeRoutines)
        {
            var last5TaskStatuses = await _context.Tasks
                .Where(t => t.RoutineId == routine.Id && t.StartDateTime < today)
                .OrderByDescending(t => t.StartDateTime)
                .Select(t => t.Status)
                .Take(5)
                .ToListAsync();

            // Nếu lấy đủ 5 task VÀ cả 5 đều đang Pending -> Cho ngủ đông
            if (last5TaskStatuses.Count == 5 && last5TaskStatuses.All(status => status == TaskStatus.Pending))
            {
                routine.IsActive = false;
                _logger.LogInformation($"Routine '{routine.Name}' đã bị tạm ngưng (IsActive=false) do bỏ lơ 5 task liên tiếp.");
                continue; 
            }
            
            var total = await ProcessSingleRoutineAsync(routine);
            newTaskCount+=total;
        }

        var changes = await _context.SaveChangesAsync();
        
        _logger.LogInformation($"Kết thúc: Đã lưu {changes} thay đổi vào DB. Trong đó đẻ ra {newTaskCount} task mới.");
    }

    private async Task<int> ProcessSingleRoutineAsync(Routine routine)
    {
        var totalGenerates = 0;
        var today = DateTime.Today.Date;
        var lookAheadDate = today.AddDays(14);
            
            var startAnchor = routine.StartDate > today ? routine.StartDate.Date : today;
            var endAnchor = (routine.EndDate.HasValue && routine.EndDate.Value < lookAheadDate) 
                ? routine.EndDate.Value.Date 
                : lookAheadDate;
            
            if(startAnchor>endAnchor) return 0;
            
            var upcomingOccurences =
                RoutineHelper.GetOccurences(startAnchor, endAnchor, routine)
                    .Where(occurence => occurence.Date >= today && occurence.Date <= lookAheadDate)
                    .ToList();

            foreach (var occurence in upcomingOccurences)
            {
                var targetDate = occurence.Date;
                var schedule = occurence.Schedule;
                
                bool taskEverExisted = await _context.Tasks
                    .IgnoreQueryFilters()
                    .AnyAsync(t=>
                        t.ScheduleId==schedule.Id &&
                        t.StartDateTime == targetDate.Add(schedule.StartTime!.Value.ToTimeSpan()));

                if (!taskEverExisted)
                {
                    var startDateTime = targetDate.Add(schedule.StartTime!.Value.ToTimeSpan());
                    var task = new TaskItem()
                    {
                        Name = routine.Name,
                        Description = routine.Description,
                        StartDateTime = startDateTime,
                        EndDateTime = startDateTime.AddMinutes(schedule.Duration!.Value),
                        Location = occurence.Schedule.Location,
                        UserId = routine.UserId,
                        RoutineId = routine.Id,
                        ScheduleId = occurence.Schedule.Id,
                        Status = TaskStatus.Pending,
                        Type = routine.Type,
                        PhaseId = routine.PhaseId,
                        StudyPlanId = routine.StudyPlanId
                    };
                    _context.Tasks.Add(task);
                    totalGenerates++;
                }
            }

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new SignalRMessage
            {
                Action = "ROUTINE_TASKS_UPDATED",
                Data = new { routineId = routine.Id, phaseId = routine.PhaseId },
                Message = $"Hệ thống đã cập nhật task cho lịch trình '{routine.Name}'"
            });

        return totalGenerates;
    }
}