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
        Task SyncCourseClassSessions(int courseId, List<ScheduleDto> scheduleDtos);
        Task<CourseWorkloadDto> GetCourseWorkloadAsync(int courseId, string? keyword);
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
                .Include(c => c.StudyPlan)
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
                dto.Progress = CalculateProgress(c);
                return dto;
            }).ToList();
        }

        public async Task<ResponseCourseDto?> GetCourseByIdAsync(int courseId)
        {
            var userId = _currentUserService.UserId;

            var course = await _context.Courses
                .Include(c => c.StudyPlan)
                .Include(c => c.Tasks)
                .ThenInclude(t => t.Logs)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;
            if (course.StudyPlan == null || course.StudyPlan.UserId != userId) return null;

            var dto = _mapper.Map<ResponseCourseDto>(course);
            dto.Progress = CalculateProgress(course);
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
                var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
                var futureTasks = await _context.Tasks
                    .Where(t => t.CourseId == courseId && t.TaskDate.HasValue && t.TaskDate.Value >= today)
                    .ToListAsync();
                _context.Tasks.RemoveRange(futureTasks);
            }

            await _context.SaveChangesAsync();
        }

        public async Task SyncCourseClassSessions(int courseId, List<ScheduleDto> scheduleDtos)
        {
            var userId = _currentUserService.UserId;
            var routine = await _context.Routines.Include(r => r.Schedules)
                .FirstOrDefaultAsync(r => r.CourseId == courseId && r.Type == TaskType.ClassSession);
            
            if(routine == null)
            {
                var course = await _context.Courses.Include(c => c.StudyPlan).FirstOrDefaultAsync(c => c.Id == courseId)
                    ?? throw new KeyNotFoundException("Không tìm thấy khóa học");
                var studyPlan = course.StudyPlan;

                // var routineDto = new RequestRoutineDto(
                //     Name: $"Lịch học {course.Name}",
                //     Description: $"Lịch học cho môn {course.Name} - HK{term}({year}-{year + 1})",
                //     StartDate: studyPlan.StartDate,
                //     EndDate: studyPlan.EndDate,
                //     Type: TaskType.ClassSession,
                //     CourseId: course.Id,
                //     TimelineEventId: null,
                //     StudyPlanId: studyPlan.Id
                // );
                //
                // var newRoutine = _mapper.Map<Routine>(routineDto);
                // _context.Routines.Add(newRoutine);
                await _context.SaveChangesAsync();
                
            }

            CollectionHelper.SyncCollection<Schedule, ScheduleDto, int>(
                existingEntities: routine.Schedules,
                incomingDtos: scheduleDtos,
                entityKeySelector: s => s.Id,
                dtoKeySelector: dto => dto.Id,
                updateAction: (schedule, dto) =>
                {
                    _mapper.Map(dto, schedule);
                },
                createFunc: dto =>
                {
                    var newSchedule = _mapper.Map<Schedule>(dto);
                    newSchedule.RoutineId = routine.Id;
                    return newSchedule;
                }
                );

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

            var allTaskIds = singleTasks.Select(t => t.Id)
                .Concat(routineTasks.Select(t => t.Id))
                .ToList();

            var allLogs = allTaskIds.Count == 0
                ? []
                : await _context.Logs
                    .AsNoTracking()
                    .Where(l => allTaskIds.Contains(l.TaskId))
                    .ToListAsync();

            var allLogIds = allLogs.Select(l => l.Id).ToList();

            var relatedLinks = (allTaskIds.Count == 0 && allLogIds.Count == 0)
                ? []
                : await _context.AssetLinks
                    .Include(al => al.Asset)
                    .AsNoTracking()
                    .Where(al =>
                        (al.LinkedType == AssetLinkType.Task && allTaskIds.Contains(al.LinkedId)) ||
                        (al.LinkedType == AssetLinkType.Log && allLogIds.Contains(al.LinkedId)))
                    .ToListAsync();

            var logsByTaskId = allLogs.GroupBy(l => l.TaskId)
                .ToDictionary(g => g.Key, g => g.ToList());

            return new CourseWorkloadDto
            {
                SingleTasks = singleTasks
                    .Select(t => BuildTaskDto(t, logsByTaskId, relatedLinks))
                    .ToList(),
                Routines = routines.Select(r => new CourseRoutineDto
                {
                    Routine = _mapper.Map<SimpleResponseRoutineDto>(r),
                    Tasks = routineTasks
                        .Where(t => t.RoutineId == r.Id)
                        .Select(t => BuildTaskDto(t, logsByTaskId, relatedLinks))
                        .ToList()
                }).ToList()
            };
        }

        private CourseTaskDto BuildTaskDto(
            TaskItem task,
            Dictionary<int, List<LogItem>> logsByTaskId,
            List<AssetLink> links)
        {
            var logs = logsByTaskId.GetValueOrDefault(task.Id, []);

            return new CourseTaskDto
            {
                Task = _mapper.Map<ResponseTaskDto>(task),
                Docs = links
                    .Where(al => al.LinkedType == AssetLinkType.Task && al.LinkedId == task.Id)
                    .Select(al => _mapper.Map<AssetResponseDto>(al.Asset))
                    .ToList(),
                Logs = logs.Select(l =>
                {
                    var mappedLog = _mapper.Map<LogDto>(l) with
                    {
                        Productivity = StatisticHelper.CalculateProductivity(l, task)
                    };

                    return new LogDoc
                    {
                        Log = mappedLog,
                        Assets = links
                            .Where(al => al.LinkedType == AssetLinkType.Log && al.LinkedId == l.Id)
                            .Select(al => _mapper.Map<AssetResponseDto>(al.Asset))
                            .ToList()
                    };
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

                    if (r.EndDate.HasValue && e.DueDate.HasValue)
                    {
                        // Nếu có cả 2, lấy ngày nào đến trước!
                        endDate = r.EndDate.Value < e.DueDate.Value ? r.EndDate.Value : e.DueDate.Value;
                    }
                    else
                    {
                        // Nếu 1 trong 2 bị null, ưu tiên lấy cái có giá trị. Khúc chót mới lấy UtcNow làm fallback
                        endDate = r.EndDate ?? e.DueDate ?? DateTime.UtcNow;
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
                    DueDate = e.DueDate,
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
        
        private double CalculateProgress(Course course)
        {
            if (course.Tasks == null || course.Tasks.Count == 0) return 0;

            var totalTasks = course.Tasks.Count;
            var completedTasks = course.Tasks.Count(t => t.Status == TaskStatus.Completed);

            var totalPlanned = course.Tasks
                .Where(t => t.PlannedDuration.HasValue)
                .Sum(t => t.PlannedDuration!.Value);

            var totalActual = course.Tasks
                .SelectMany(t => t.Logs ?? [])
                .Sum(l => l.ActualDuration);

            var taskRatio     = (double)completedTasks / totalTasks;
            var durationRatio = totalPlanned == 0 ? 0 : (double)totalActual / totalPlanned;

            // Clamp về [0, 1] phòng trường hợp actual > planned
            var raw = taskRatio * 0.4 + durationRatio * 0.6;
            return Math.Min(Math.Round(raw * 100, 1), 100);
        }
    }
}
