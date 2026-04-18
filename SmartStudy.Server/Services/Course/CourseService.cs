using Hangfire;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Jobs;
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
    }
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public CourseService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<List<ResponseCourseDto>> GetCoursesAsync(int? studyPlanId)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Courses
                .AsNoTracking()
                .Include(c => c.StudyPlan)
                .Include(c => c.Phases)
                .ThenInclude(p => p.Tasks)
                .Include(c => c.Phases)
                .ThenInclude(p => p.Routines)
                .ThenInclude(r => r.Schedules)
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
                .Include(c => c.Phases)
                .ThenInclude(p => p.Tasks)
                .Include(c => c.Phases)
                .ThenInclude(p => p.Routines)
                .ThenInclude(r => r.Schedules)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;
            if (course.StudyPlan == null || course.StudyPlan.UserId != userId) return null;

            var dto = _mapper.Map<ResponseCourseDto>(course);
                var courseProgressDto = StudyProgressHelper.CalculateCourseProgress(course);
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

                var studyPlan = await _context.StudyPlans.FirstOrDefaultAsync(sp => sp.Id == course.StudyPlanId);
                if (studyPlan == null || studyPlan.UserId != _currentUserService.UserId)
                {
                    throw new KeyNotFoundException("Không tìm thấy kế hoạch học tập hoặc bạn không có quyền thêm khóa học vào kế hoạch này.");
                }

                var generalPhase = new Phase
                {
                    CourseId = course.Id,
                    Title = "Giai đoạn chung",
                    Type = PhaseType.General,
                    Priority = PriorityLevel.Low,
                    StartDateTime = studyPlan.StartDate,
                    EndDateTime = studyPlan.EndDate,
                };
                _context.Phases.Add(generalPhase);
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
            
            var phaseIds = await _context.Phases.Where(p => p.CourseId == courseId).Select(p => p.Id).ToListAsync();
            var taskIds = await _context.Tasks.Where(t => t.PhaseId.HasValue && phaseIds.Contains(t.PhaseId.Value)).Select(t => t.Id).ToListAsync();
            var logIds = await _context.Logs.Where(l => taskIds.Contains(l.TaskId)).Select(l => l.Id).ToListAsync();
            
            await _context.CascadeSoftDeleteLinkAsync(logIds, AssetLinkType.Log);
            await _context.CascadeSoftDeleteLinkAsync(taskIds, AssetLinkType.Task);

            if (logIds.Any())
            {
                await _context.Logs.Where(l => logIds.Contains(l.Id)).SoftDeleteBulkAsync();
            }
            if(taskIds.Any())
            {
                await _context.Tasks.Where(t => taskIds.Contains(t.Id)).SoftDeleteBulkAsync();
            }

            var routineIds = await _context.Routines.Where(r => r.PhaseId.HasValue && phaseIds.Contains(r.PhaseId.Value)).Select(r => r.Id).ToListAsync();
            if (routineIds.Any()){
                await _context.Routines.Where(r => routineIds.Contains(r.Id)).SoftDeleteBulkAsync();
                foreach (var routineId in routineIds)
                {
                    BackgroundJob.Enqueue<IRoutineClearJob>(
                        job => job.CleanupTasksForRoutineAsync(routineId, isRoutineDeleted: true) 
                    );
                }
            }
            
            await _context.CascadeSoftDeleteLinkAsync(courseId, AssetLinkType.Course);
            _context.Remove(existingCourse);
            
            await _context.SaveChangesAsync();

            EnqueueGraphDeletes(GraphSyncEntityType.Log, logIds);
            EnqueueGraphDeletes(GraphSyncEntityType.Task, taskIds);
            EnqueueGraphDeletes(GraphSyncEntityType.Routine, routineIds);
            EnqueueGraphDeletes(GraphSyncEntityType.Phase, phaseIds);

            return true;
        }

        private static void EnqueueGraphDeletes(GraphSyncEntityType entityType, IEnumerable<int> entityIds)
        {
            foreach (var entityId in entityIds.Distinct())
            {
                if (entityId <= 0)
                {
                    continue;
                }

                BackgroundJob.Enqueue<IGraphSyncBackgroundJob>(job =>
                    job.ExecuteSyncAsync(entityType, entityId, GraphSyncChangeType.Deleted));
            }
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
                    .Where(t => t.PhaseId.HasValue && t.StartDateTime.HasValue && t.StartDateTime.Value.Date >= today.Date)
                    .Where(t => _context.Phases.Any(p => p.Id == t.PhaseId && p.CourseId == courseId))
                    .ToListAsync();
                _context.Tasks.RemoveRange(futureTasks);

                var futureRoutines = await _context.Routines
                    .Where(r => r.PhaseId.HasValue && r.StartDate.Date >= today.Date)
                    .Where(r => _context.Phases.Any(p => p.Id == r.PhaseId && p.CourseId == courseId))
                    .Select(r => r.Id)
                    .ToListAsync();

                foreach (var routineId in futureRoutines)
                {
                    BackgroundJob.Enqueue<IRoutineClearJob>(
                        job => job.CleanupTasksForRoutineAsync(routineId) 
                    );
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<CourseWorkloadDto> GetCourseWorkloadAsync(int courseId, string? keyword)
        {
            keyword = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();
            var keywordPattern = keyword is null ? null : $"%{keyword}%";

            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) throw new KeyNotFoundException("Không tìm thấy khóa học");

            var phases = await _context.Phases
                .AsNoTracking()
                .Where(p => p.CourseId == courseId)
                .ToListAsync();

            if (phases.Count == 0)
            {
                return new CourseWorkloadDto();
            }

            var phaseIds = phases.Select(p => p.Id).ToList();

            var singleTasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.PhaseId.HasValue
                    && phaseIds.Contains(t.PhaseId.Value)
                    && t.RoutineId == null
                    && (keywordPattern == null
                        || EF.Functions.ILike(t.Name, keywordPattern)
                        || (t.Description != null && EF.Functions.ILike(t.Description, keywordPattern))))
                .ToListAsync();

            var routines = await _context.Routines
                .AsNoTracking()
                .Include(r => r.Schedules)
                .Where(r => r.PhaseId.HasValue && phaseIds.Contains(r.PhaseId.Value))
                .ToListAsync();

            var singleTasksForProgress = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.PhaseId.HasValue
                    && phaseIds.Contains(t.PhaseId.Value)
                    && t.RoutineId == null)
                .ToListAsync();

            var routineIds = routines.Select(r => r.Id).ToList();
            var routineTasks = routineIds.Count == 0
                ? []
                : await _context.Tasks
                    .AsNoTracking()
                    .Where(t => t.RoutineId.HasValue
                        && routineIds.Contains(t.RoutineId.Value))
                    .ToListAsync();

            var routineTasksByRoutineId = routineTasks
                .GroupBy(t => t.RoutineId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            var phaseWorkloads = phases.Select(phase =>
            {
                var phaseTitleMatched = keyword != null
                                        && phase.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase);

                var phaseSingleTasksForProgress = singleTasksForProgress
                    .Where(t => t.PhaseId == phase.Id)
                    .ToList();

                var phaseSingleTasks = singleTasks
                    .Where(t => t.PhaseId == phase.Id)
                    .OrderBy(t => t.StartDateTime)
                    .Select(t => _mapper.Map<ResponseTaskDto>(t))
                    .ToList();

                var phaseRoutinesSource = routines
                    .Where(r => r.PhaseId == phase.Id)
                    .Where(r =>
                    {
                        if (keyword == null) return true;
                        if (phaseTitleMatched) return true;

                        if (r.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }

                        return routineTasksByRoutineId.TryGetValue(r.Id, out var tasks)
                               && tasks.Any(t => t.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase));
                    })
                    .ToList();

                var phaseRoutines = phaseRoutinesSource
                    .Select(routine =>
                    {
                        routineTasksByRoutineId.TryGetValue(routine.Id, out var thisRoutineTasks);
                        thisRoutineTasks ??= [];

                        var endDate = CalculateRoutineEndDate(phase.EndDateTime, routine.EndDate);
                        var occurrences = RoutineHelper.GetOccurences(routine.StartDate, endDate, routine)
                            .Select((occurrence, index) =>
                            {
                                var matchedTask = thisRoutineTasks.FirstOrDefault(t =>
                                    t.StartDateTime.HasValue
                                    && t.StartDateTime.Value.Date == occurrence.Date.Date
                                    && (!t.ScheduleId.HasValue || t.ScheduleId == occurrence.Schedule.Id));

                                return new CourseOccurenceDto
                                {
                                    Number = index + 1,
                                    Date = occurrence.Date,
                                    Schedule = new CourseOccurenceScheduleDto
                                    {
                                        Id = occurrence.Schedule.Id,
                                        DayOfWeek = occurrence.Schedule.DayOfWeek,
                                        StartTime = occurrence.Schedule.StartTime,
                                        Duration = occurrence.Schedule.Duration,
                                        Location = occurrence.Schedule.Location
                                    },
                                    TaskId = matchedTask?.Id ?? 0,
                                    TaskName = matchedTask?.Name ?? $"{routine.Name} #{index + 1}",
                                    Status = (matchedTask?.Status ?? TaskStatus.Pending).ToString(),
                                    IsCompleted = matchedTask?.Status == TaskStatus.Completed
                                };
                            })
                            .ToList();

                        return new CourseRoutineDto
                        {
                            Routine = _mapper.Map<SimpleResponseRoutineDto>(routine),
                            Occurences = occurrences
                        };
                    })
                    .ToList();

                var phaseProgress = CalculatePhaseProgress(
                    phase,
                    phaseSingleTasksForProgress,
                    routines.Where(r => r.PhaseId == phase.Id).ToList(),
                    routineTasksByRoutineId
                );

                return new CoursePhaseWorkloadDto
                {
                    Id = phase.Id,
                    Title = phase.Title,
                    StartDateTime = phase.StartDateTime,
                    EndDateTime = phase.EndDateTime,
                    PhaseType = phase.Type,
                    Priority = phase.Priority,
                    Location = phase.Location,
                    Notes = phase.Notes,
                    Progress = phaseProgress.Progress,
                    TotalExpectations = phaseProgress.TotalExpectations,
                    TotalCompletions = phaseProgress.TotalCompletions,
                    Tasks = phaseSingleTasks,
                    Routines = phaseRoutines
                };
            }).ToList();

            if (keyword != null)
            {
                phaseWorkloads = phaseWorkloads
                    .Where(p => p.Tasks.Count > 0 || p.Routines.Count > 0)
                    .ToList();
            }

            return new CourseWorkloadDto
            {
                Phases = phaseWorkloads
            };
        }

        private static DateTime CalculateRoutineEndDate(DateTime? phaseEndDate, DateTime? routineEndDate)
        {
            if (phaseEndDate.HasValue && routineEndDate.HasValue)
            {
                return phaseEndDate.Value < routineEndDate.Value ? phaseEndDate.Value : routineEndDate.Value;
            }

            if (routineEndDate.HasValue)
            {
                return routineEndDate.Value;
            }

            if (phaseEndDate.HasValue)
            {
                return phaseEndDate.Value;
            }

            return DateTime.UtcNow.AddHours(7);
        }

        private static CourseProgressDto CalculatePhaseProgress(
            Phase phase,
            List<SmartStudy.Server.Entities.TaskItem> phaseSingleTasks,
            List<Routine> phaseRoutines,
            Dictionary<int, List<SmartStudy.Server.Entities.TaskItem>> routineTasksByRoutineId)
        {
            var allRoutineTasks = phaseRoutines
                .SelectMany(routine =>
                    routineTasksByRoutineId.TryGetValue(routine.Id, out var tasks)
                        ? tasks
                        : [])
                .ToList();

            var allPhaseTasks = phaseSingleTasks.Concat(allRoutineTasks).ToList();
            var totalCompletedTasks = allPhaseTasks
                .Where(t => t.Status == TaskStatus.Completed)
                .ToList();

            var totalSingleExpectations = phaseSingleTasks.Count(t =>
                t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress);

            var totalRoutineExpectations = 0;

            foreach (var routine in phaseRoutines)
            {
                var endAnchor = CalculateRoutineEndDate(phase.EndDateTime, routine.EndDate);

                if (endAnchor < routine.StartDate)
                {
                    continue;
                }

                var occurrences = RoutineHelper.GetOccurences(routine.StartDate, endAnchor, routine);
                var occurrenceCount = occurrences.Count();
                var completedRoutineTasks = allRoutineTasks.Count(t =>
                    t.RoutineId == routine.Id && t.Status == TaskStatus.Completed);

                var thisRoutineExpectations = occurrenceCount - completedRoutineTasks;
                if (thisRoutineExpectations < 0)
                {
                    thisRoutineExpectations = 0;
                }

                if (routine.IsActive)
                {
                    totalRoutineExpectations += thisRoutineExpectations;
                }
            }

            var totalCompletions = totalCompletedTasks.Count;
            var totalExpectations = totalSingleExpectations + totalRoutineExpectations + totalCompletedTasks.Count;
            var progress = totalExpectations > 0
                ? Math.Min(1.0, (double)totalCompletions / totalExpectations)
                : 0;

            return new CourseProgressDto
            {
                Progress = Math.Round(progress * 100, 1),
                TotalExpectations = totalExpectations,
                TotalCompletions = totalCompletions
            };
        }

        private CourseProgressDto CalculateProgress(Course course)
        {
            var allTasks = course.Phases.SelectMany(p => p.Tasks);
            var allRoutines = course.Phases.SelectMany(p => p.Routines);
            var totalCompletedTasks = allTasks.Where(t => t.Status == TaskStatus.Completed);

            // --- 1. XỬ LÝ TASK ĐƠN LẺ (SINGLE TASKS) ---
            // Những task này không lặp lại, nên thực tế bao nhiêu thì dự kiến bấy nhiêu
            int totalSingleExpectations = allTasks.Count(t => t.RoutineId == null
                && (t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress));

            // --- 2. XỬ LÝ ROUTINE (PROJECTION) ---
            int totalRoutineExpectations = 0;
            
            foreach (var routine in allRoutines)
            {
                var endAnchor = routine.EndDate ?? DateTime.UtcNow.AddHours(7);
                
                var occurrences = RoutineHelper.GetOccurences(routine.StartDate, endAnchor, routine);
                
                // Mỗi Occurrence (lần lặp) là 1 đơn vị công việc dự kiến
                var thisRoutineOccurences = occurrences.Count();
                var thisRoutineExpectations = thisRoutineOccurences - allTasks.Count(t => t.RoutineId == routine.Id && t.Status == TaskStatus.Completed);
                if(thisRoutineExpectations < 0) thisRoutineExpectations = 0;
                if(routine.IsActive) // Chỉ tính định mức từ những routine đang active, routine đã tắt thì thôi không tính nữa
                    totalRoutineExpectations += thisRoutineExpectations;
            }

            // --- 3. TÍNH TOÁN TỔNG THỂ ---
            int totalCompletions = allTasks.Count(t => t.Status == TaskStatus.Completed);

            int totalExpectations = totalSingleExpectations + totalRoutineExpectations + (totalCompletedTasks?.Count() ?? 0);

            // Tránh lỗi chia cho 0 và đảm bảo tiến độ không vượt quá 100% (nếu User làm vượt định mức)
            double progress = totalExpectations > 0 
                ? Math.Min(1.0, (double)totalCompletions / totalExpectations) 
                : 0;

            return new CourseProgressDto
            {
                Progress = Math.Round(progress * 100, 1),
                TotalExpectations = totalExpectations,
                TotalCompletions = totalCompletions
            };
        }
        
        private double CalculateEfficiency(Course course)
        {
            var allTasks = course.Phases.SelectMany(p => p.Tasks).ToList();
            if (allTasks.Count == 0) return 0;

            var totalTasks = allTasks.Count;
            var completedTasks = allTasks.Count(t => t.Status == TaskStatus.Completed);

            var totalPlanned = allTasks
                .Where(t => t.StartDateTime.HasValue && t.EndDateTime.HasValue)
                .Sum(t => (t.EndDateTime!.Value - t.StartDateTime!.Value).TotalMinutes);

            var totalActual = allTasks
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
