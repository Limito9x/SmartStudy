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
            var course = _context.Courses.Include(c=>c.StudyPlan).FirstOrDefault(c => c.Id == RoutineDto.CourseId);

            // 1. Mapster tự động map luôn cả Routine VÀ danh sách Schedules bên trong
            var Routine = _mapper.Map<Entities.Routine>(RoutineDto);
            Routine.UserId = userId;
            var now = DateTime.UtcNow;
            // 1. LOGIC TÍNH START DATE: 
// Nếu UI có gửi lên -> Dùng của UI. 
// Nếu UI gửi rỗng -> Dùng ngày của Plan (nhưng lấy >= hiện tại để không gen Task trong quá khứ)
            if (RoutineDto.StartDate.HasValue)
            {
                // Đảm bảo lưu UTC để không lệch múi giờ
                Routine.StartDate = RoutineDto.StartDate.Value.ToUniversalTime(); 
            }
            else
            {
                Routine.StartDate = course.StudyPlan.StartDate > now ? course.StudyPlan.StartDate : now;
            }

// 2. LOGIC TÍNH END DATE:
// Nếu UI có gửi lên -> Dùng của UI. 
// Nếu UI gửi rỗng -> Kế thừa ngày kết thúc của Plan
            if (RoutineDto.EndDate.HasValue)
            {
                Routine.EndDate = RoutineDto.EndDate.Value.ToUniversalTime();
            }
            else
            {
                Routine.EndDate = course.StudyPlan.EndDate;
            }

// 3. (Tùy chọn nhưng RẤT NÊN CÓ) Validate: 
// StartDate không được lớn hơn EndDate
            if (Routine.EndDate.HasValue && Routine.StartDate > Routine.EndDate.Value)
            {
                throw new ArgumentException("Ngày bắt đầu lịch trình không được lớn hơn ngày kết thúc!");
            }

            // 2. EF Core tự động lưu Routine VÀ toàn bộ Schedules con, tự gắn khóa ngoại cực chuẩn
            _context.Routines.Add(Routine);
            await _context.SaveChangesAsync(); 

            // 3. Lúc này Routine và Schedules đã yên vị trong DB, chỉ việc đẻ Task
            if (Routine.Schedules != null && Routine.Schedules.Any())
            {
                await GenerateTasksAsync(Routine.Id, DateTime.UtcNow.AddDays(14));
            }

            return _mapper.Map<ResponseRoutineDto>(Routine);    
        }

        public async Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId)
        {
            var Routine = await _context.Routines
                .Include(r => r.Schedules)
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