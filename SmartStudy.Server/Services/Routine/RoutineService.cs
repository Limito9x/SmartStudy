using Hangfire;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Services
{
    public record Occurence(DateTime Date, Schedule Schedule);

    public interface IRoutineService
    {
        Task<ResponseRoutineDto> CreateRoutineAsync(RequestRoutineDto RoutineDto);
        Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId);
        Task<List<SimpleResponseRoutineDto>> GetRoutinesByUserIdAsync(int? StudyPlanId, int? CourseId, TaskType? Type);
        Task<ResponseRoutineDto?> UpdateRoutineAsync(int RoutineId, RequestRoutineDto RoutineDto);
        Task GenerateTasksAsync(int RoutineId, DateTime Until);
        Task<List<ResponseTaskDto>> GetUpcomingTasksAsync(int RoutineId, int? daysAhead);
        Task<bool> DeleteRoutineAsync(int RoutineId);
        Task<ResponseRoutineDto> ToggleRoutineStatusAsync(int RoutineId);
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
            var course = _context.Courses.Include(c=>c.StudyPlan).FirstOrDefault(c => c.Id == RoutineDto.CourseId);

            // 1. Mapster tự động map luôn cả Routine VÀ danh sách Schedules bên trong
            var routine = _mapper.Map<Routine>(RoutineDto);
            routine.UserId = userId;
            var now = DateTime.UtcNow;
            // 1. LOGIC TÍNH START DATE: 
        // Nếu UI có gửi lên -> Dùng của UI. 
        // Nếu UI gửi rỗng -> Dùng ngày của Plan (nhưng lấy >= hiện tại để không gen Task trong quá khứ)
            if (RoutineDto.StartDate.HasValue)
            {
                // Đảm bảo lưu UTC để không lệch múi giờ
                routine.StartDate = RoutineDto.StartDate.Value.ToUniversalTime(); 
            }
            else
            {
                routine.StartDate = course.StudyPlan.StartDate > now ? course.StudyPlan.StartDate : now;
            }

            // 2. LOGIC TÍNH END DATE:
            // Nếu UI có gửi lên -> Dùng của UI. 
            // Nếu UI gửi rỗng -> Kế thừa ngày kết thúc của Plan
            if (RoutineDto.EndDate.HasValue)
            {
                routine.EndDate = RoutineDto.EndDate.Value.ToUniversalTime();
            }
            else
            {
                routine.EndDate = course.StudyPlan.EndDate;
            }

            // 3. (Tùy chọn nhưng RẤT NÊN CÓ) Validate: 
            // StartDate không được lớn hơn EndDate
            if (routine.EndDate.HasValue && routine.StartDate > routine.EndDate.Value)
            {
                throw new ArgumentException("Ngày bắt đầu lịch trình không được lớn hơn ngày kết thúc!");
            }

            // 2. EF Core tự động lưu Routine VÀ toàn bộ Schedules con, tự gắn khóa ngoại cực chuẩn
            _context.Routines.Add(routine);
            await _context.SaveChangesAsync(); 

            // 3. Lúc này Routine và Schedules đã yên vị trong DB, chỉ việc đẻ Task
            if (routine.Schedules != null && routine.Schedules.Any())
            {
                BackgroundJob.Enqueue<IRoutineTaskGenerator>(
                    generator=>generator.GenerateForSingleRoutineAsync(routine.Id)
                );
            }

            return _mapper.Map<ResponseRoutineDto>(routine);    
        }

        public async Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId)
        {
            var Routine = await _context.Routines
                .Include(r => r.Schedules)
                .Include(r => r.Tasks)
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

        await _context.SaveChangesAsync();

        BackgroundJob.Enqueue<IRoutineClearJob>(
            job => job.CleanupTasksForRoutineAsync(RoutineId) // Xóa các Task cũ không còn phù hợp sau khi chỉnh sửa Routine
        );

        if (existingRoutine.Schedules.Count > 0)
        {
            BackgroundJob.Enqueue<RoutineTaskGenerator>(
                generator=>generator.GenerateForSingleRoutineAsync(existingRoutine.Id)
            );
        }

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
            
            BackgroundJob.Enqueue<IRoutineClearJob>(
                job => job.CleanupTasksForRoutineAsync(RoutineId, isRoutineDeleted: true) // Xóa các Task liên quan khi xóa Routine
            );

            _context.Routines.Remove(existingRoutine);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ResponseRoutineDto> ToggleRoutineStatusAsync(int RoutineId)
        {
            var existingRoutine = await _context.Routines.FindAsync(RoutineId);
            if (existingRoutine == null) throw new KeyNotFoundException("Không tìm thấy routine!");

            existingRoutine.IsActive = !existingRoutine.IsActive;
            if(!existingRoutine.IsActive)
            {
                BackgroundJob.Enqueue<IRoutineClearJob>(
                    job => job.CleanupTasksForRoutineAsync(RoutineId) 
                );
            }
            else
            {
                // Nếu bật lại routine thì gen Task cho các lịch học (nếu có)
                BackgroundJob.Enqueue<IRoutineTaskGenerator>(
                    generator=>generator.GenerateForSingleRoutineAsync(existingRoutine.Id)
                );
            }
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseRoutineDto>(existingRoutine);
        }

        public async Task GenerateTasksAsync(int RoutineId, DateTime Until)
        {
            var userId = _currentUserService.UserId;
            var Routine = await _context.Routines
                .Include(r => r.Schedules)
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (Routine == null) return;

            var existingTasks = await _context.Tasks
                .Where(t => t.RoutineId == RoutineId && t.UserId == userId && t.StartDateTime <= Until)
                .ToListAsync();
            
            // ---------------------------------------------------------
            // 1. XÁC ĐỊNH NGÀY BẮT ĐẦU (startAnchor)
            // Ưu tiên lấy ngày lớn hơn giữa "Hôm nay" và "Ngày bắt đầu Routine"
            // (Để tuyệt đối không gen Task trong quá khứ)
            // ---------------------------------------------------------
            var today = DateTime.UtcNow.Date;
            var startAnchor = Routine.StartDate.Date > today ? Routine.StartDate.Date : today;

            // ---------------------------------------------------------
            // 2. XÁC ĐỊNH NGÀY KẾT THÚC (endAnchor)
            // Ưu tiên lấy ngày nhỏ hơn giữa "Ngày Until (VD: 14 ngày tới)" và "Ngày kết thúc Routine"
            // (Để Routine có hạn 1 tuần thì không bị đẻ Task lố sang tuần 2)
            // ---------------------------------------------------------
            var targetUntil = Until.Date;
            var endAnchor = targetUntil;
    
            if (Routine.EndDate.HasValue && Routine.EndDate.Value.Date < targetUntil)
            {
                endAnchor = Routine.EndDate.Value.Date;
            }
            
            var tasksToInsert = new List<TaskItem>();

            foreach (var occurence in GetOccurences(startAnchor, endAnchor, Routine))
            {
                var startDateTime = occurence.Date.Add(occurence.Schedule.StartTime!.Value.ToTimeSpan());
                if(existingTasks.Any(t => t.ScheduleId == occurence.Schedule.Id && t.StartDateTime == startDateTime))
                {
                    continue; // Bỏ qua nếu đã tồn tại Task cho lịch trình này vào ngày này
                }
                {
                    var task = new TaskItem
                    {
                        Name = Routine.Name,
                        Description = Routine.Description,
                        StartDateTime = startDateTime,
                        EndDateTime = startDateTime.AddMinutes(occurence.Schedule.Duration!.Value),
                        Location = occurence.Schedule.Location,
                        UserId = userId,
                        RoutineId = RoutineId,
                        ScheduleId = occurence.Schedule.Id,
                        Status = Entities.Enums.TaskStatus.Pending,
                        Type = Routine.Type,
                        TimelineEventId = Routine.TimelineEventId,
                        StudyPlanId = Routine.StudyPlanId,
                        CourseId = Routine.CourseId
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
            var today = DateTime.UtcNow.Date;

            // Lấy hết các Task sắp tới cho Routine
            var query = _context.Tasks
                .AsNoTracking()
                .Where(t => t.RoutineId == RoutineId &&
                            t.UserId == userId && t.StartDateTime > today);

            // Nếu có giới hạn ngày, áp dụng bộ lọc
            if (daysAhead.HasValue)
            {
                var endDate = today.AddDays(daysAhead.Value);
                query = query.Where(t => t.StartDateTime <= endDate);
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