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
    }
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ISubjectService _subjectService;
        private readonly IStudyPlanService _studyPlanService;
        private readonly IMapper _mapper;

        public CourseService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAssetLinkService assetLinkService,
            ISubjectService subjectService,
            IStudyPlanService studyPlanService,
            IRoutineService routineService,
            ITimelineEventService timelineEventService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _assetLinkService = assetLinkService;
            _subjectService = subjectService;
            _studyPlanService = studyPlanService;
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
            var userId = _currentUserService.UserId;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var studyPlan = await _studyPlanService.GetStudyPlanByIdAsync(courseDto.StudyPlanId);

                var course = _mapper.Map<Entities.Course>(courseDto);
                course.StudyPlanId = courseDto.StudyPlanId;

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();
                
                // var routineDto = new RequestRoutineDto(
                //     Name: $"Lịch học {course.Name}",
                //     Description: $"Lịch học cho môn {course.Name} - HK{term} ({year}-{year + 1})",
                //     StartDate: studyPlan.StartDate,
                //     EndDate: studyPlan.EndDate,
                //     Type: TaskType.ClassSession,
                //     CourseId: course.Id,
                //     TimelineEventId: null,
                //     StudyPlanId: studyPlan.Id
                // );
                //
                // var routine = _mapper.Map<Routine>(routineDto);
                // routine.UserId = userId;
                //
                // _context.Routines.Add(routine);

                await _context.SaveChangesAsync();

                // var autoEvents = GenerateAutoEventsForCourse(course.Id, subject.Type);
                // if (autoEvents != null && autoEvents.Count > 0)
                // {
                //     _context.TimelineEvents.AddRange(autoEvents);
                //     await _context.SaveChangesAsync();
                // }

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
            _context.Remove(existingCourse);
            await _assetLinkService.RemoveAssetLinkByAsync(courseId, Entities.Enums.AssetLinkType.Course);
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

        // private List<TimelineEvent>? GenerateAutoEventsForCourse(int courseId, SubjectType subjectType)
        // {
        //     // Bí kíp C#: Luôn dùng TryGetValue với Dictionary để không bao giờ bị Crash app
        //     if (SubjectEventRegistry.Templates.TryGetValue(subjectType, out var templates))
        //     {
        //         // Dùng LINQ Select để "đúc" từ Template thành Entity thật
        //         var timelineEvents = templates.Select(t => new TimelineEvent
        //         {
        //             CourseId = courseId,
        //             Title = t.Title,
        //             Type = t.Type,
        //             Priority = t.Priority,
        //             DueDate = null
        //         }).ToList();
        //
        //         return timelineEvents;
        //     }
        //
        //     return null;
        // }
        
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
