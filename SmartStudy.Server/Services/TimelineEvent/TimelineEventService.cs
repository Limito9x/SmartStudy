using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Services
{
    public interface ITimelineEventService
    {
        Task<ResponseTimelineEventDto> CreateAsync(RequestTimelineEventDto dto);
        Task<List<ResponseTimelineEventDto>> GetEventsAsync(int? studyPlanId, int? courseId);
        Task<ResponseTimelineEventDto> GetByIdAsync(int timelineEventId);
        Task<ResponseTimelineEventDto?> UpdateAsync(int timelineEventId, RequestTimelineEventDto dto);
        Task<bool> DeleteAsync(int timelineEventId);
        Task BulkCreateAsync(List<RequestTimelineEventDto> dtos);
    }

    public class TimelineEventService : ITimelineEventService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public TimelineEventService(ApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ResponseTimelineEventDto> CreateAsync(RequestTimelineEventDto dto)
        {
            var userId = _currentUserService.UserId;

            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == dto.CourseId);
            if (course?.StudyPlan == null || course.StudyPlan.UserId != userId)
            {
                throw new UnauthorizedAccessException("Not authorized to add timeline events to this course.");
            }

            var entity = _mapper.Map<Entities.TimelineEvent>(dto);
            _context.TimelineEvents.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<ResponseTimelineEventDto>(entity);
        }

        public async Task<List<ResponseTimelineEventDto>> GetEventsAsync(int? studyPlanId, int? courseId)
        {
            var userId = _currentUserService.UserId;

            var isAuthorized = await _context.Courses
                .Include(c => c.StudyPlan)
                .AnyAsync(c => c.Id == courseId && c.StudyPlan!.UserId == userId);

            if (!isAuthorized) return [];

            var query = _context.TimelineEvents
                .Include(e => e.Course)
                .ThenInclude(c => c.StudyPlan)
                .AsNoTracking();
            
            if(studyPlanId.HasValue)
            {
                query = query.Where(e => e.Course.StudyPlanId == studyPlanId.Value);
            }
            else if (courseId.HasValue)
            {
                query = query.Where(e => e.CourseId == courseId.Value);
            }
            
            var events = await query.ToListAsync();

            return _mapper.Map<List<ResponseTimelineEventDto>>(events);
        }
        
        public async Task<ResponseTimelineEventDto> GetByIdAsync(int timelineEventId)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.TimelineEvents
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == timelineEventId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return null;

            return _mapper.Map<ResponseTimelineEventDto>(entity);
        }

        public async Task<ResponseTimelineEventDto?> UpdateAsync(int timelineEventId, RequestTimelineEventDto dto)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.TimelineEvents
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .FirstOrDefaultAsync(e => e.Id == timelineEventId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return null;

            // Prevent moving an event to a different course.
            entity.Title = dto.Title;
            entity.StartDateTime = dto.StartDateTime;
            entity.EndDateTime = dto.EndDateTime;
            entity.IsAllDay = dto.IsAllDay;

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseTimelineEventDto>(entity);
        }

        public async Task<bool> DeleteAsync(int timelineEventId)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.TimelineEvents
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .FirstOrDefaultAsync(e => e.Id == timelineEventId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return false;

            _context.TimelineEvents.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task BulkCreateAsync(List<RequestTimelineEventDto> dtos)
        {
            var events = _mapper.Map<List<TimelineEvent>>(dtos);
            _context.TimelineEvents.AddRange(events);
            await _context.SaveChangesAsync();
        }
    }
}

