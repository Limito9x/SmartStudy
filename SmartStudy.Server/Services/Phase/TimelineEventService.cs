using Hangfire;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services
{
    public interface IPhaseService
    {
        Task<ResponsePhaseDto> CreateAsync(RequestPhaseDto dto);
        Task<List<ResponsePhaseDto>> GetEventsAsync(int? studyPlanId, int? courseId);
        Task<ResponsePhaseDto> GetByIdAsync(int phaseId);
        Task<ResponsePhaseDto?> UpdateAsync(int phaseId, RequestPhaseDto dto);
        Task<bool> DeleteAsync(int phaseId);
        Task BulkCreateAsync(List<RequestPhaseDto> dtos);
    }

    public class PhaseService : IPhaseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public PhaseService(ApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ResponsePhaseDto> CreateAsync(RequestPhaseDto dto)
        {
            var userId = _currentUserService.UserId;

            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == dto.CourseId);
            if (course?.StudyPlan == null || course.StudyPlan.UserId != userId)
            {
                throw new UnauthorizedAccessException("Not authorized to add timeline events to this course.");
            }

            var entity = _mapper.Map<Entities.Phase>(dto);
            _context.Phases.Add(entity);
            await _context.SaveChangesAsync();

            // Tự động tạo Milestone task ở ngày cuối phase nếu có EndDateTime
            if (entity.EndDateTime.HasValue)
            {
                var milestoneDate = entity.EndDateTime.Value.Date;
                var milestone = new TaskItem
                {
                    Name = $"Deadline: {entity.Title}",
                    Type = TaskType.Milestone,
                    PhaseId = entity.Id,
                    StartDateTime = milestoneDate,
                    EndDateTime = milestoneDate,
                    Status = TaskStatus.Pending,
                    UserId = userId
                };
                _context.Tasks.Add(milestone);
                await _context.SaveChangesAsync();
            }

            return _mapper.Map<ResponsePhaseDto>(entity);
        }

        public async Task<List<ResponsePhaseDto>> GetEventsAsync(int? studyPlanId, int? courseId)
        {
            var userId = _currentUserService.UserId;

            var isAuthorized = await _context.Courses
                .Include(c => c.StudyPlan)
                .AnyAsync(c => c.Id == courseId && c.StudyPlan!.UserId == userId);

            if (!isAuthorized) return [];

            var query = _context.Phases
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

            return _mapper.Map<List<ResponsePhaseDto>>(events);
        }
        
        public async Task<ResponsePhaseDto> GetByIdAsync(int phaseId)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.Phases
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == phaseId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return null;

            return _mapper.Map<ResponsePhaseDto>(entity);
        }

        public async Task<ResponsePhaseDto?> UpdateAsync(int phaseId, RequestPhaseDto dto)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.Phases
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .FirstOrDefaultAsync(e => e.Id == phaseId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return null;

            // Prevent moving an event to a different course.
            entity.Title = dto.Title;
            entity.StartDateTime = dto.StartDateTime;
            entity.EndDateTime = dto.EndDateTime;
            entity.Type = dto.Type;
            entity.Priority = dto.Priority;
            entity.Location = dto.Location;
            entity.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponsePhaseDto>(entity);
        }

        public async Task<bool> DeleteAsync(int phaseId)
        {
            var userId = _currentUserService.UserId;

            var entity = await _context.Phases
                .Include(e => e.Course)
                    .ThenInclude(c => c.StudyPlan)
                .FirstOrDefaultAsync(e => e.Id == phaseId);

            if (entity?.Course?.StudyPlan == null || entity.Course.StudyPlan.UserId != userId) return false;

            var routinesToRemove = await _context.Routines.Where(r => r.PhaseId == phaseId)
            .Select(r => r.Id)
            .ToListAsync();
            _context.Phases.Remove(entity);

            await _context.SaveChangesAsync();

            foreach (var routineId in routinesToRemove)
            {
                BackgroundJob.Enqueue<IRoutineClearJob>(x => x.CleanupTasksForRoutineAsync(routineId, true));
            }
            return true;
        }

        public async Task BulkCreateAsync(List<RequestPhaseDto> dtos)
        {
            var userId = _currentUserService.UserId;
            var phases = _mapper.Map<List<Phase>>(dtos);
            _context.Phases.AddRange(phases);
            await _context.SaveChangesAsync();

            // Tự động tạo Milestone task cho mỗi phase có EndDateTime
            var milestones = phases
                .Where(p => p.EndDateTime.HasValue)
                .Select(p => new TaskItem
                {
                    Name = $"Deadline: {p.Title}",
                    Type = TaskType.Milestone,
                    PhaseId = p.Id,
                    StartDateTime = p.EndDateTime!.Value.Date,
                    EndDateTime = p.EndDateTime!.Value.Date,
                    Status = TaskStatus.Pending,
                    UserId = userId
                })
                .ToList();

            if (milestones.Count > 0)
            {
                _context.Tasks.AddRange(milestones);
                await _context.SaveChangesAsync();
            }
        }
    }
}

