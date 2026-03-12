using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Exceptions;
using ScheduleEntity = SmartStudy.Server.Entities.Schedule;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services
{
    public interface IScheduleService
    {
        Task<ResponseScheduleDto> CreateAsync(RequestScheduleDto dto);
        Task<ResponseScheduleDto?> UpdateAsync(int scheduleId, UpdateScheduleDto dto);
        Task<bool> DeleteAsync(int scheduleId);
        Task<List<CalendarTaskDto>> GetCalendarAsync(int studyPlanId, DateOnly fromDate, DateOnly toDate);
    }

    public class ScheduleService : IScheduleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public ScheduleService(ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ResponseScheduleDto> CreateAsync(RequestScheduleDto dto)
        {
            ValidateSchedule(dto.Duration);

            var userId = _currentUserService.UserId;
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var routine = await _context.Routines
                .Include(r => r.Course)
                    .Include(r => r.StudyPlan)
                .FirstOrDefaultAsync(r => r.Id == dto.RoutineId && r.UserId == userId)
                ?? throw new KeyNotFoundException("Không tìm thấy routine");

            if (routine.CourseId <= 0)
            {
                throw new AppException("Routine chưa liên kết course, không thể tạo task từ schedule.");
            }

            var schedule = new ScheduleEntity
            {
                RoutineId = routine.Id,
                DayOfWeek = dto.DayOfWeek,
                StartTime = dto.StartTime,
                Duration = dto.Duration,
                DurationUnit = dto.DurationUnit,
                Location = dto.Location
            };

            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();

            var generationStartDate = GetGenerationStartDate(routine);
            var generationEndDate = GetGenerationEndDate(routine, generationStartDate);

            var tasks = BuildTasksForNewSchedule(schedule, routine, userId, generationStartDate, generationEndDate);
            if (tasks.Count > 0)
            {
                _context.Tasks.AddRange(tasks);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            return MapSchedule(schedule);
        }

        public async Task<ResponseScheduleDto?> UpdateAsync(int scheduleId, UpdateScheduleDto dto)
        {
            ValidateSchedule(dto.Duration);

            var userId = _currentUserService.UserId;
            var schedule = await _context.Schedules
                .Include(s => s.Routine)
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.Routine != null && s.Routine.UserId == userId);

            if (schedule == null)
            {
                return null;
            }

            schedule.DayOfWeek = dto.DayOfWeek;
            schedule.StartTime = dto.StartTime;
            schedule.Duration = dto.Duration;
            schedule.DurationUnit = dto.DurationUnit;
            schedule.Location = dto.Location;

            await _context.SaveChangesAsync();
            return MapSchedule(schedule);
        }

        public async Task<bool> DeleteAsync(int scheduleId)
        {
            var userId = _currentUserService.UserId;
            var schedule = await _context.Schedules
                .Include(s => s.Routine)
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.Routine != null && s.Routine.UserId == userId);

            if (schedule == null)
            {
                return false;
            }

            await _context.Tasks
                .Where(t => t.ScheduleId == scheduleId 
                            && t.Status == TaskStatus.Pending
                            && (t.Logs == null || !t.Logs.Any()))
                .ExecuteDeleteAsync();

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CalendarTaskDto>> GetCalendarAsync(int studyPlanId, DateOnly fromDate, DateOnly toDate)
        {
            if (fromDate > toDate)
            {
                throw new AppException("fromDate không được lớn hơn toDate.");
            }

            var userId = _currentUserService.UserId;
            var isAuthorized = await _context.StudyPlans
                .AnyAsync(sp => sp.Id == studyPlanId && sp.UserId == userId);

            if (!isAuthorized)
            {
                throw new KeyNotFoundException("Không tìm thấy study plan");
            }

            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(t =>
                    t.UserId == userId &&
                    t.TaskDate.HasValue &&
                    t.StartTime.HasValue &&        // phải có giờ
                    t.DurationMinutes.HasValue &&  // phải có thời lượng
                    t.TaskDate.Value >= fromDate &&
                    t.TaskDate.Value <= toDate &&
                    t.StudyPlanId == studyPlanId)
                .OrderBy(t => t.TaskDate)
                .ThenBy(t => t.StartTime)
                .ToListAsync();
            

            return _mapper.Map<List<CalendarTaskDto>>(tasks);
        }

        private static ResponseScheduleDto MapSchedule(ScheduleEntity schedule)
        {
            return new ResponseScheduleDto(
                Id: schedule.Id,
                RoutineId: schedule.RoutineId ?? 0,
                DayOfWeek: schedule.DayOfWeek,
                StartTime: schedule.StartTime,
                Duration: schedule.Duration,
                DurationUnit: schedule.DurationUnit,
                Location: schedule.Location
            );
        }

        private static void ValidateSchedule(int duration)
        {
            if (duration <= 0)
            {
                throw new AppException("Duration phải lớn hơn 0.");
            }
        }

        private static TimeOnly? CalculateEndTime(TimeOnly? startTime, int? durationMinutes)
        {
            if (!startTime.HasValue || !durationMinutes.HasValue || durationMinutes <= 0)
            {
                return null;
            }

            return startTime.Value.AddMinutes(durationMinutes.Value);
        }

        private static List<TaskItem> BuildTasksForNewSchedule(ScheduleEntity schedule, Routine routine, int userId, DateTime generationStartDate, DateTime generationEndDate)
        {
            if (generationEndDate < generationStartDate)
            {
                return [];
            }

            var durationMinutes = CalculateDurationMinutes(schedule);
            var tasks = new List<TaskItem>();

            for (var date = generationStartDate; date <= generationEndDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek != schedule.DayOfWeek)
                {
                    continue;
                }

                tasks.Add(new TaskItem
                {
                    Name = routine.Name,
                    Description = routine.Description,
                    TaskDate = DateOnly.FromDateTime(date),
                    StartTime = schedule.StartTime,
                    DurationMinutes = durationMinutes,
                    Location = schedule.Location,
                    UserId = userId,
                    RoutineId = routine.Id,
                    ScheduleId = schedule.Id,
                    Status = TaskStatus.Pending,
                    Type = routine.Type,
                    EventRequirementId = routine.EventRequirementId,
                    CourseId = routine.CourseId,
                    StudyPlanId = routine.StudyPlanId
                });
            }

            return tasks;
        }

        private static int? CalculateDurationMinutes(ScheduleEntity schedule)
        {
            if (!schedule.Duration.HasValue || schedule.Duration.Value <= 0)
            {
                return null;
            }

            return schedule.DurationUnit switch
            {
                TimeUnit.Hours => schedule.Duration.Value * 60,
                TimeUnit.Periods => schedule.Duration.Value * 45,
                _ => schedule.Duration.Value
            };
        }

        private static DateTime GetGenerationStartDate(Routine routine)
        {
            var startDate = routine.StartDate;
            var today = DateTime.Today.Date;
            
            // Ngày nào lớn hơn lấy ngày đó
            return startDate > today ? startDate : today;
        }

        private static DateTime GetGenerationEndDate(Routine routine, DateTime generationStartDate)
        {
            var studyPlan = routine.StudyPlan;

            return (DateTime)(routine.EndDate.HasValue ? routine.EndDate : studyPlan.EndDate);
        }
    }
}


