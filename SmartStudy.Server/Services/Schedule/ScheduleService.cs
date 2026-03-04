using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.UserService;
using System.Linq.Expressions;

namespace SmartStudy.Server.Services.Schedule
{
    public interface IScheduleService
    {
        // Đăng ký lịch với Course hoặc Routine
        Task RegisterScheduleAsync(ScheduleRequestDto ScheduleRequestDto);
        Task<List<ScheduleResponseDto>> GetSchedulesAsync(ScheduleQuery query);
        Task<List<ScheduleResponseDto>> GetCourseSchedulesBySemesterIdAsync(int semesterId);
    }
    public class ScheduleService : IScheduleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public ScheduleService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task RegisterScheduleAsync(ScheduleRequestDto ScheduleRequestDto)
        {
            var schedule = _mapper.Map<Entities.Schedule>(ScheduleRequestDto);
            if (ScheduleRequestDto.OwnerType == ScheduleOwnerType.Course)
            {
                schedule.CourseId = ScheduleRequestDto.OwnerId;
            }
            else if (ScheduleRequestDto.OwnerType == ScheduleOwnerType.Routine)
            {
                schedule.RoutineId = ScheduleRequestDto.OwnerId;
            }
            else
            {
                throw new Exception("Invalid schedule owner type");
            }
            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ScheduleResponseDto>> GetSchedulesAsync(ScheduleQuery query)
        {
            var ownerType = query.OwnerType;
            var ownerId = query.OwnerId;
            Expression<Func<Entities.Schedule, bool>> predicate =
        ownerType switch
        {
            ScheduleOwnerType.Course =>
                s => s.CourseId == ownerId,

            ScheduleOwnerType.Routine =>
                s => s.RoutineId == ownerId,

            _ => throw new ArgumentOutOfRangeException()
        };
            var schedules = await _context.Schedules.Where(predicate).ToListAsync();

            return _mapper.Map<List<ScheduleResponseDto>>(schedules);
        }

        public async Task<List<ScheduleResponseDto>> GetCourseSchedulesBySemesterIdAsync(int semesterId)
        {
            var userId = _currentUserService.UserId;
            var schedules = await _context.Schedules.Include(s => s.Course)
                .Where(s => s.Course.SemesterId == semesterId && s.Course.UserId == userId)
                .ToListAsync();
            return _mapper.Map<List<ScheduleResponseDto>>(schedules);
        }
    }
}
