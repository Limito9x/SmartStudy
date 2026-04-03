using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services
{
    public interface ICourseService
    {
        Task<List<ResponseCourseDto>> GetCoursesAsync(int? studyPlanId);
        Task<ResponseCourseDto?> GetCourseByIdAsync(int courseId);
        Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto courseDto);
        Task<ResponseCourseDto?> UpdateCourseAsync(int courseId, RequestCourseDto courseDto);
        Task<bool> DeleteCourseAsync(int courseId);
        Task UpdateCourseStatusAsync(int courseId, UpdateCourseStatusDto dto);
        //Task UpdateCourseProgressAsync(int CourseId);
        Task<CourseWorkloadDto> GetCourseWorkloadAsync(int courseId, string? keyword);
        Task UpdateCourseGoalAsync(int courseId, string goal);
        Task UpdateCourseTargetScoreAsync(int courseId, double targetScore);
        Task UpdateCourseFinalScoreAsync(int courseId, double finalScore);
        Task<List<CourseEventDto>> GetCourseEventsAsync(int courseId);
    }
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IRoutineService _routineService;
        private readonly IMapper _mapper;

        public CourseService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IRoutineService routineService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _routineService = routineService;
            _mapper = mapper;
        }

        public async Task<List<ResponseCourseDto>> GetCoursesAsync(int? studyPlanId)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Courses
                .AsNoTracking()
                .Include(c => c.StudyPlan)
                .Include(c => c.Tasks)
                .Include(c=>c.Routines)
                .ThenInclude(r=>r.Schedules)
                .Where(c => c.StudyPlan!.UserId == userId);
            
            if (studyPlanId.HasValue)
            {
                // Filter theo plan cụ thể
                query = query.Where(c => c.StudyPlanId == studyPlanId.Value);
            }
            else
            {
                // Không truyền planId → chỉ lấy plan Active
                query = query.Where(c => c.StudyPlan!.Status == StudyPlanStatus.Active);
            }
            
            var courses = await query.ToListAsync();
            
            return courses.Select(c => {
                var dto = c.Adapt<ResponseCourseDto>();
                var courseProgressDto = CalculateProgress(c);
                dto.TotalExpectations = courseProgressDto.TotalExpectations;
                dto.TotalCompletions = courseProgressDto.TotalCompletions;
                dto.Progress = courseProgressDto.Progress;
                return dto;
            }).ToList();
        }

        public async Task<ResponseCourseDto?> GetCourseByIdAsync(int courseId)
        {
            var userId = _currentUserService.UserId;

            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .Include(c=>c.TimelineEvents)
                .Include(c => c.Tasks)
                .Include(c=>c.Routines)
                .ThenInclude(r=>r.Schedules)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;
            if (course.StudyPlan == null || course.StudyPlan.UserId != userId) return null;

            var dto = _mapper.Map<ResponseCourseDto>(course);
                var courseProgressDto = CalculateProgress(course);
                dto.TotalExpectations = courseProgressDto.TotalExpectations;
                dto.TotalCompletions = courseProgressDto.TotalCompletions;
                dto.Progress = courseProgressDto.Progress;
            return dto;
        }

        public async Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto courseDto)
        {

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var course = _mapper.Map<Course>(courseDto);
                course.StudyPlanId = courseDto.StudyPlanId;

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                await _context.Entry(course).Reference(c => c.StudyPlan).LoadAsync();
                return _mapper.Map<ResponseCourseDto>(course);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }

        }

        public async Task<ResponseCourseDto?> UpdateCourseAsync(int courseId, RequestCourseDto courseDto)
        {
            var userId = _currentUserService.UserId;

            var existingCourse = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (existingCourse == null) return null;
            
            _mapper.Map(courseDto, existingCourse);

            existingCourse.StudyPlanId = courseDto.StudyPlanId;

            await _context.SaveChangesAsync();

            return _mapper.Map<ResponseCourseDto>(existingCourse);
        }

        public async Task<bool> DeleteCourseAsync(int courseId)
        {
            var userId = _currentUserService.UserId;
            var existingCourse = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (existingCourse == null) return false;
            if (existingCourse.StudyPlan == null || existingCourse.StudyPlan.UserId != userId) return false;
            
            var taskIds = await _context.Tasks.Where(t => t.CourseId == courseId).Select(t => t.Id).ToListAsync();
            var logIds = await _context.Logs.Where(l => taskIds.Contains(l.TaskId)).Select(l => l.Id).ToListAsync();
            
            await _context.CascadeSoftDeleteLinkAsync(logIds, AssetLinkType.Log);
            await _context.CascadeSoftDeleteLinkAsync(taskIds, AssetLinkType.Task);

            if (logIds.Any())
            {
                _context.Logs.Where(l => logIds.Contains(l.Id)).SoftDeleteBulkAsync();
            }
            if(taskIds.Any())
            {
                _context.Tasks.Where(t => taskIds.Contains(t.Id)).SoftDeleteBulkAsync();
            }
            
            await _context.CascadeSoftDeleteLinkAsync(courseId, AssetLinkType.Course);
            _context.Remove(existingCourse);
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateCourseStatusAsync(int courseId, UpdateCourseStatusDto dto)
        {
            var userId = _currentUserService.UserId;
            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null || course.StudyPlan == null || course.StudyPlan.UserId != userId) return;

            course.Status = dto.Status;

            if (dto.Status == CourseStatus.Dropped || dto.Status == CourseStatus.Completed)
            {
                var today = DateTime.UtcNow.AddHours(7);
                var futureTasks = await _context.Tasks
                    .Where(t => t.CourseId == courseId && t.StartDateTime.HasValue && t.StartDateTime.Value.Date >= today.Date)
                    .ToListAsync();
                _context.Tasks.RemoveRange(futureTasks);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<CourseWorkloadDto> GetCourseWorkloadAsync(int courseId, string? keyword)
        {
            keyword = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();

            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) throw new KeyNotFoundException("Không tìm thấy khóa học");

            var singleTasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.CourseId == courseId
                    && t.RoutineId == null
                    && (keyword == null || t.Name.Contains(keyword)))
                .ToListAsync();

            var routines = await _context.Routines
                .AsNoTracking()
                .Where(r => r.CourseId == courseId)
                .ToListAsync();

            var routineIds = routines.Select(r => r.Id).ToList();
            var routineTasks = routineIds.Count == 0
                ? []
                : await _context.Tasks
                    .AsNoTracking()
                    .Where(t => t.RoutineId.HasValue
                        && routineIds.Contains(t.RoutineId.Value)
                        && (keyword == null || t.Name.Contains(keyword)))
                    .ToListAsync();

            return new CourseWorkloadDto
            {
                SingleTasks = singleTasks
                    .Select(t => _mapper.Map<ResponseTaskDto>(t))
                    .ToList(),
                Routines = routines.Select(r => new CourseRoutineDto
                {
                    Routine = _mapper.Map<SimpleResponseRoutineDto>(r),
                    Tasks = routineTasks
                        .Where(t => t.RoutineId == r.Id)
                        .Select(t => _mapper.Map<ResponseTaskDto>(t))
                        .ToList()
                }).ToList()
            };
        }
        
        public async Task<List<CourseEventDto>> GetCourseEventsAsync(int courseId)
        {
            var events = await _context.TimelineEvents
                .AsNoTracking()
                .AsSplitQuery()
                .Include(e => e.Tasks)
                .Include(e => e.Routines)
                .ThenInclude(r => r.Schedules)
                .Where(e => e.CourseId == courseId)
                .ToListAsync();

            var courseEvents = events.Select(e =>
            {
                var singleTasks = e.Tasks
                    .Where(t => t.RoutineId == null)
                    .Select(t => _mapper.Map<EventTaskDto>(t));

                var routines = e.Routines.Select(r =>
                {
                    DateTime endDate;

                    if (r.EndDate.HasValue)
                    {
                        // Nếu có cả 2, lấy ngày nào đến trước!
                        endDate = r.EndDate.Value < e.EndDateTime ? r.EndDate.Value : e.EndDateTime;
                    }
                    else
                    {
                        // Nếu 1 trong 2 bị null, ưu tiên lấy cái có giá trị. Khúc chót mới lấy UtcNow làm fallback
                        endDate = r.EndDate ?? e.EndDateTime;
                    }
                    
                    var totalCompletions = r.Tasks.Count(t => t.Status == TaskStatus.Completed);
                    var totalOccurrences = RoutineHelper.GetOccurences(r.StartDate, endDate, r).Count();
                    
                    return new EventRoutineDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Type = r.Type,
                        TotalCompletion = totalCompletions,
                        TotalOccurrences = totalOccurrences
                    };
                });
                
                var completedTasks = singleTasks.Count(t=>t.Status==TaskStatus.Completed) + routines.Sum(r => r.TotalCompletion);
                var totalPlanned = singleTasks.Count() + routines.Sum(r => r.TotalOccurrences);
                
                return new CourseEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    Priority = e.Priority,
                    EventType = e.Type,
                    Location = e.Location,
                    Notes = e.Notes,
                    Tasks = singleTasks.ToList(),
                    Routines = routines.ToList(),
                    CompletedTasks = completedTasks,
                    TotalTasks = totalPlanned
                };
            }).ToList();

            return courseEvents;
        }

        private CourseProgressDto CalculateProgress(Course course)
        {
            var totalOccurences = course.Routines.Sum(r=>
                RoutineHelper.GetOccurences(r.StartDate, r.EndDate ?? DateTime.UtcNow, r).Count());
            
            var singleTasks = course.Tasks.Where(t => t.RoutineId == null).ToList();
            var completedTasks = course.Tasks.Count(t => t.Status == TaskStatus.Completed);
            
            var totalPlanned = totalOccurences + singleTasks.Count();
            var progress = completedTasks / (double)totalPlanned;
            
            return new CourseProgressDto
            {
                Progress = Math.Round(progress * 100, 1),
                TotalExpectations = totalPlanned,
                TotalCompletions = completedTasks
            };
        }
        
        private double CalculateEfficiency(Course course)
        {
            if (course.Tasks == null || course.Tasks.Count == 0) return 0;

            var totalTasks = course.Tasks.Count;
            var completedTasks = course.Tasks.Count(t => t.Status == TaskStatus.Completed);

            var totalPlanned = course.Tasks
                .Where(t => t.StartDateTime.HasValue && t.EndDateTime.HasValue)
                .Sum(t => (t.EndDateTime!.Value - t.StartDateTime!.Value).TotalMinutes);

            var totalActual = course.Tasks
                .SelectMany(t => t.Logs ?? [])
                .Sum(l => l.ActualDuration);

            var taskRatio     = (double)completedTasks / totalTasks;
            var durationRatio = totalPlanned == 0 ? 0 : (double)totalActual / totalPlanned;

            // Clamp về [0, 1] phòng trường hợp actual > planned
            var raw = taskRatio * 0.4 + durationRatio * 0.6;
            return Math.Min(Math.Round(raw * 100, 1), 100);
        }
        
        public async Task UpdateCourseGoalAsync(int courseId, string goal)
        {
            var userId = _currentUserService.UserId;
            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null || course.StudyPlan == null || course.StudyPlan.UserId != userId) return;

            course.Goal = goal;
            await _context.SaveChangesAsync();
        }
        
        public async Task UpdateCourseTargetScoreAsync(int courseId, double targetScore)
        {
            var userId = _currentUserService.UserId;
            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null || course.StudyPlan == null || course.StudyPlan.UserId != userId) return;

            course.TargetScore = targetScore;
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCourseFinalScoreAsync(int courseId, double finalScore)
        {
            var userId = _currentUserService.UserId;
            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null || course.StudyPlan == null || course.StudyPlan.UserId != userId) return;

            course.FinalScore = finalScore;
            await _context.SaveChangesAsync();
        }
    }
}
