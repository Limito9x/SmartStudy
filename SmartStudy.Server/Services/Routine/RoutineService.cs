using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services
{
    public record Occurence(DateTime Date, Schedule Schedule);
    // Toàn bộ CRUD về routine thường xoay quanh thông tin công việc
    // Không có tác động gì đến lịch (schedule)
    // Chỉ khi gán lịch -> sinh ra Task
    public interface IRoutineService
    {
        Task<ResponseRoutineDto> CreateRoutineAsync(RequestRoutineDto RoutineDto);
        Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId);
        Task<List<SimpleResponseRoutineDto>> GetRoutinesByUserIdAsync(int? StudyPlanId, int? CourseId, TaskType? Type);
        Task<ResponseRoutineDto?> UpdateRoutineAsync(int RoutineId, RequestRoutineDto RoutineDto);
        Task GenerateTasksAsync(int RoutineId, DateTime Until);
        Task<List<ResponseTaskDto>> GetUpcomingTasksAsync(int RoutineId, int? daysAhead);
        Task<bool> DeleteRoutineAsync(int RoutineId);
    }
    public class RoutineService : IRoutineService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public RoutineService(ApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        // Routine thường tạo ra trước nhưng chưa gán lịch
        public async Task<ResponseRoutineDto> CreateRoutineAsync(RequestRoutineDto RoutineDto)
        {
                var userId = _currentUserService.UserId;
                var studyPlan = _context.StudyPlans.FirstOrDefault(sp => sp.Id == RoutineDto.StudyPlanId && sp.UserId == userId);
                if (studyPlan == null) throw new KeyNotFoundException("Không tìm thấy kế hoạc học tập");
                var Routine = _mapper.Map<Entities.Routine>(RoutineDto);
                Routine.UserId = userId;
                var now = DateTime.UtcNow;
                Routine.StartDate=studyPlan.StartDate>now?studyPlan.StartDate:now;
                Routine.EndDate=studyPlan.EndDate;

                _context.Routines.Add(Routine);
                
                await _context.SaveChangesAsync();

                var schedules = RoutineDto.
                Schedules?.Select(s => {
                    var schedule = _mapper.Map<Schedule>(s);
                    schedule.RoutineId = Routine.Id;
                    return schedule;
                }).ToList();
            
                if (schedules != null && schedules.Any())
                {
                    _context.Schedules.AddRange(schedules);
                    await GenerateTasksAsync(Routine.Id, DateTime.UtcNow.AddDays(14));
                    await _context.SaveChangesAsync();
                }
                

                return _mapper.Map<ResponseRoutineDto>(Routine);       
        }

        public async Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId)
        {
            var Routine = await _context.Routines
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (Routine == null) return null;
            return _mapper.Map<ResponseRoutineDto>(Routine);
        }

        public async Task<List<SimpleResponseRoutineDto>> GetRoutinesByUserIdAsync(int? StudyPlanId, int? CourseId, TaskType? Type)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Routines.Include(r=>r.Schedules)
                .AsNoTracking()
                .Where(r => r.UserId == userId);

            if (StudyPlanId.HasValue)
                query = query.Where(r => r.StudyPlanId == StudyPlanId);
            
            if(CourseId.HasValue)
                query = query.Where(r => r.CourseId == CourseId);

            if (Type.HasValue)
                query = query.Where(r => r.Type == Type);

            var routines = await query.ToListAsync();
            return _mapper.Map<List<SimpleResponseRoutineDto>>(routines);
        }

        public async Task<ResponseRoutineDto?> UpdateRoutineAsync(int RoutineId, RequestRoutineDto RoutineDto)
{
    var existingRoutine = await _context.Routines
        .Include(r => r.Schedules)
        .FirstOrDefaultAsync(r => r.Id == RoutineId && r.UserId == _currentUserService.UserId);
        
    if (existingRoutine == null) return null;

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // 1. Cập nhật thông tin cơ bản của Routine
        var config = new TypeAdapterConfig();
        config.NewConfig<RequestRoutineDto, Routine>().Ignore(r => r.Schedules);
        RoutineDto.Adapt(existingRoutine, config);

        // 2. Đồng bộ danh sách Schedule con (Thêm/Sửa/Xóa lịch học)
        CollectionHelper.SyncCollection<Schedule, ScheduleDto, int>(
            existingEntities: existingRoutine.Schedules,
            incomingDtos: RoutineDto.Schedules ?? new List<ScheduleDto>(),
            entityKeySelector: s => s.Id,
            dtoKeySelector: s => s.Id,
            updateAction: (existingSchedule, dtoSchedule) =>
            {
                _mapper.Map(dtoSchedule, existingSchedule);
            },
            createFunc: dtoSchedule =>
            {
                var newSchedule = _mapper.Map<Schedule>(dtoSchedule);
                newSchedule.RoutineId = existingRoutine.Id;
                return newSchedule;
            }
        );

        // 3. Dọn rác: Xóa các Pending Task KHÔNG có log trong tương lai
        await _context.Tasks
            .Where(t => t.RoutineId == RoutineId 
                     && t.UserId == _currentUserService.UserId 
                     && t.Status == Entities.Enums.TaskStatus.Pending
                     && t.Logs == null
                     && t.TaskDate >= DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .ExecuteDeleteAsync();

        await _context.SaveChangesAsync();

        // 4. Sinh lại Task mới cho 30 ngày
        await GenerateTasksAsync(existingRoutine.Id, DateTime.UtcNow.AddDays(14));

        await transaction.CommitAsync();
        return _mapper.Map<ResponseRoutineDto>(existingRoutine);
    }
    catch (Exception)
    {
        await transaction.RollbackAsync();
        throw;
    }
}
        public async Task<bool> DeleteRoutineAsync(int RoutineId)
        {
            var existingRoutine = await _context.Routines.FindAsync(RoutineId);
            if (existingRoutine == null) return false;
            await _context.Tasks
                .Where(t => t.RoutineId == RoutineId 
                            && t.UserId == _currentUserService.UserId 
                            && t.Status == Entities.Enums.TaskStatus.Pending
                            && t.Logs == null
                            && t.TaskDate >= DateOnly.FromDateTime(DateTime.UtcNow.Date))
                .ExecuteDeleteAsync();
            _context.Routines.Remove(existingRoutine);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task GenerateTasksAsync(int RoutineId, DateTime Until)
        {
            var userId = _currentUserService.UserId;
            var Routine = await _context.Routines
                .Include(r => r.Schedules)
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (Routine == null) return;

            var existingTasks = await _context.Tasks
                .Where(t => t.RoutineId == RoutineId && t.UserId == userId && t.TaskDate <= DateOnly.FromDateTime(Until))
                .ToListAsync();

            var startDate = DateTime.UtcNow.Date;
            var endDate = Until.Date.AddDays(1).AddSeconds(-1);
            var tasksToInsert = new List<TaskItem>();

            foreach (var occurence in GetOccurences(startDate, endDate, Routine))
            {
                if(existingTasks.Any(t => t.ScheduleId == occurence.Schedule.Id && t.TaskDate == DateOnly.FromDateTime(occurence.Date)))
                {
                    continue; // Bỏ qua nếu đã tồn tại Task cho lịch trình này vào ngày này
                }
                {
                    var task = new TaskItem
                    {
                        Name = Routine.Name,
                        Description = Routine.Description,
                        TaskDate = DateOnly.FromDateTime(occurence.Date),
                        StartTime = occurence.Schedule.StartTime,
                        PlannedDuration = occurence.Schedule.Duration,
                        Location = occurence.Schedule.Location,
                        UserId = userId,
                        RoutineId = RoutineId,
                        ScheduleId = occurence.Schedule.Id,
                        Status = Entities.Enums.TaskStatus.Pending,
                        Type = Routine.Type,
                        TimelineEventId = Routine.TimelineEventId,
                        StudyPlanId = Routine.StudyPlanId
                    };
                    tasksToInsert.Add(task);
                }
                
            }
            
            // Chạy xong vòng lặp mới AddRange và Save 1 LẦN DUY NHẤT
            if (tasksToInsert.Any())
            {
                _context.Tasks.AddRange(tasksToInsert);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ResponseTaskDto>> GetUpcomingTasksAsync(int RoutineId, int? daysAhead)
        {
            var userId = _currentUserService.UserId;
            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

            // Lấy hết các Task sắp tới cho Routine
            var query = _context.Tasks
                .AsNoTracking()
                .Where(t => t.RoutineId == RoutineId &&
                            t.UserId == userId && t.TaskDate>today);

            // Nếu có giới hạn ngày, áp dụng bộ lọc
            if (daysAhead.HasValue)
            {
                var endDate = today.AddDays(daysAhead.Value);
                query = query.Where(t => t.TaskDate <= endDate);
            }

            var tasks = await query.ToListAsync();
            return _mapper.Map<List<ResponseTaskDto>>(tasks);
        }

        // Hàm tiện ích
        private IEnumerable<Occurence> GetOccurences(DateTime startAnchor, DateTime endAnchor, Routine routine, int? maxCount = 1000)
        {
            var count = 0;
            var schedules = routine.Schedules;
            for (var date = startAnchor; date <= endAnchor; date = date.AddDays(1))
            {
                foreach (var schedule in schedules)
                {
                    if (count >= maxCount) yield break;
                    if (date.DayOfWeek==schedule.DayOfWeek)
                    {
                        yield return new Occurence(date, schedule);
                        count++;
                    }
                }
            }
        }
    }
}