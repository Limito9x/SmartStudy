using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services;

public class RoutineTaskGenerator
{
    private readonly ILogger<RoutineTaskGenerator> _logger;
    private readonly ApplicationDbContext _context;
    
    public RoutineTaskGenerator(ILogger<RoutineTaskGenerator> logger,
        ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
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
            .Include(r => r.Course) // Include Khóa học để xét tư cách
            .Where(r => 
                r.IsActive == true && // Tư cách 1: Lịch đang bật
                r.Course.Status == CourseStatus.Enrolled && // Tư cách 2: Môn học chưa chốt sổ
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
                        TimelineEventId = routine.TimelineEventId,
                        StudyPlanId = routine.StudyPlanId,
                        CourseId = routine.CourseId
                    };
                    _context.Tasks.Add(task);
                    totalGenerates++;
                }
            }
        return totalGenerates;
    }
}