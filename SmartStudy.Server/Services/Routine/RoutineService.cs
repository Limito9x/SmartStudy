using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.Routine
{
    public interface IRoutineService
    {
        Task<ResponseRoutineDto> CreateRoutineAsync(RequestRoutineDto RoutineDto);
        Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId);
        Task<List<SimpleResponseRoutineDto>> GetRoutinesByUserIdAsync();
        Task<ResponseRoutineDto?> UpdateRoutineAsync(int RoutineId, RequestRoutineDto RoutineDto);
        System.Threading.Tasks.Task GenerateTasksAsync(int RoutineId, DateTime Until);
        Task<List<ResponseTaskDto>> GetUpcomingTasksAsync(int RoutineId, int? daysAhead);
        Task<bool> DeleteRoutineAsync(int RoutineId);
    }
    public class RoutineService: IRoutineService
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
        //private async Task<int> CalculateNewExpectedTotalCount(int RoutineId, Timeslot newRule)
        //{
        //    var today = DateTime.UtcNow.Date;

        //    // Bước 1: Lấy số lượng TaskLog ĐÃ PHÁT SINH trong quá khứ (trước hôm nay)
        //    // Bao gồm cả Success, Failed, Skipped vì chúng đại diện cho "phiên đã qua"
        //    var pastLogsCount = await _context.TaskLogs
        //        .CountAsync(l => l.RoutineId == RoutineId && l.CreatedAt < today);

        //    // Bước 2: Tìm đối tượng Routine để lấy thông tin EndDate
        //    var Routine = await _context.Routines
        //        .Include(r => r.Course)
        //        .FirstOrDefaultAsync(r => r.Id == RoutineId);

        //    if (Routine == null) return 0;

        //    // Bước 3: Tính toán mẫu số cho tương lai (từ hôm nay đến khi kết thúc)
        //    // Chúng ta dùng Rule mới cho giai đoạn này
        //    var searchEnd = Routine.EndDate ?? Routine.Course.EndDate;

        //    // Gọi hàm IcalHelper đã viết ở câu trước
        //    // Mốc bắt đầu tìm kiếm là 'today' (để áp dụng rule mới ngay từ hôm nay)
        //    var futureOccurrences = IcalHelper.GetOccurrences(today, searchEnd, newRule);

        //    // Bước 4: Tổng mẫu số mới = Thực tế quá khứ + Ước lượng tương lai
        //    return pastLogsCount + futureOccurrences.Count;
        //}
        public async Task<ResponseRoutineDto> CreateRoutineAsync(RequestRoutineDto RoutineDto)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var Routine = _mapper.Map<Entities.Routine>(RoutineDto);
                Routine.UserId = userId;

                _context.Routines.Add(Routine);

                var ScheduleList = _mapper.Map<List<Entities.Schedule>>(RoutineDto.Schedules);

                foreach (var schedule in ScheduleList)
                {
                    schedule.Routine = Routine;
                    _context.Schedules.Add(schedule);
                }

                await _context.SaveChangesAsync();

                // Tạo trước các Task cho Routine trong 14 ngày tới
                await GenerateTasksAsync(Routine.Id, Routine.EndDate ?? DateTime.UtcNow.AddDays(14));

                return _mapper.Map<ResponseRoutineDto>(Routine);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RoutineService] Error creating Routine: {ex.Message}");
                Console.WriteLine($"[RoutineService] Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<ResponseRoutineDto?> GetRoutineByIdAsync(int RoutineId)
        {
            var Routine = await _context.Routines
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (Routine == null) return null;
            return _mapper.Map<ResponseRoutineDto>(Routine);
        }
        
        public async Task<List<SimpleResponseRoutineDto>> GetRoutinesByUserIdAsync()
        {
            var userId = _currentUserService.UserId;
            var Routines = await _context.Routines
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .ToListAsync();
            return _mapper.Map<List<SimpleResponseRoutineDto>>(Routines);
        }

        public async Task<ResponseRoutineDto?> UpdateRoutineAsync(int RoutineId, RequestRoutineDto RoutineDto)
        {
            var existingRoutine = await _context.Routines
                .Include(r => r.Schedules)
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (existingRoutine == null) return null;
            _mapper.Map(RoutineDto, existingRoutine);

            // Cập nhật Schedules
            foreach (var scheduleDto in RoutineDto.Schedules ?? [])
            {
                var existingSchedule = existingRoutine.Schedules
                    .FirstOrDefault(s => s.Id == scheduleDto.Id);
                if (existingSchedule != null)
                {
                    // Cập nhật Schedule hiện có
                    _mapper.Map(scheduleDto, existingSchedule);
                }
                else
                {
                    // Thêm Schedule mới
                    var newSchedule = _mapper.Map<Entities.Schedule>(scheduleDto);
                    newSchedule.RoutineId = existingRoutine.Id;
                    _context.Schedules.Add(newSchedule);
                }
            }

            var deletedSchedules = existingRoutine.Schedules
                .Where(s => RoutineDto.Schedules == null || !RoutineDto.Schedules.Any(dto => dto.Id == s.Id))
                .ToList();
            _context.Schedules.RemoveRange(deletedSchedules);

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseRoutineDto>(existingRoutine);
        }

        public async Task<bool> DeleteRoutineAsync(int RoutineId)
        {
            var existingRoutine = await _context.Routines.FindAsync(RoutineId);
            if (existingRoutine == null) return false;
            _context.Routines.Remove(existingRoutine);
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task GenerateTasksAsync(int RoutineId, DateTime Until)
        {
            var userId = _currentUserService.UserId;
            var Routine = await _context.Routines
                .Include(r => r.Schedules)
                .FirstOrDefaultAsync(r => r.Id == RoutineId);
            if (Routine == null) return;
            var datesToGenerate = new List<DateTime>();
            foreach (var schedule in Routine.Schedules)
            {
                var occurrences = IcalHelper.GetOccurrences(DateTime.UtcNow.Date, Until, schedule);
                datesToGenerate.AddRange(occurrences);
            }

            // Lọc các ngày trùng lặp và sắp xếp tăng dần
            datesToGenerate = datesToGenerate
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            foreach (var date in datesToGenerate)
            {
                var newTask = new Entities.TaskItem
                {
                    Name = Routine.Name,
                    Description = Routine.Description,
                    UserId = userId,
                    RoutineId = Routine.Id,
                };
                _context.Tasks.Add(newTask);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<ResponseTaskDto>> GetUpcomingTasksAsync(int RoutineId, int? daysAhead)
        {
            var userId = _currentUserService.UserId;
            var today = DateTime.UtcNow.Date;

            // Lấy hết các Task sắp tới cho Routine
            var query = _context.Tasks
                .AsNoTracking()
                .Where(t => t.RoutineId == RoutineId &&
                            t.UserId == userId &&
                            t.DueDate >= today);

            // Nếu có giới hạn ngày, áp dụng bộ lọc
            if (daysAhead.HasValue)
            {
                var endDate = today.AddDays(daysAhead.Value);
                query = query.Where(t => t.DueDate <= endDate);
            }
            
            var tasks = await query.ToListAsync();
            return _mapper.Map<List<ResponseTaskDto>>(tasks);
        }

    }
}
