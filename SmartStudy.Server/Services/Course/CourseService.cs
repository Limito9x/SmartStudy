using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services
{
    public interface ICourseService
    {
        Task<List<SimpleResponseCourseDto>> GetCoursesByStudyPlanIdAsync(int studyPlanId);
        Task<ResponseCourseDto?> GetCourseByIdAsync(int courseId);
        Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto courseDto);
        Task<ResponseCourseDto?> UpdateCourseAsync(int courseId, RequestCourseDto courseDto);
        Task<bool> DeleteCourseAsync(int courseId);
        //Task UpdateCourseProgressAsync(int CourseId);
    }
    public class CourseService: ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ISubjectService _subjectService;
        private readonly IStudyPlanService _studyPlanService;
        private readonly IRoutineService _routineService;
        private readonly ITimelineEventService _timelineEventService;
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
            _routineService = routineService;
            _timelineEventService = timelineEventService;
            _mapper = mapper;
        }

        public async Task<List<SimpleResponseCourseDto>> GetCoursesByStudyPlanIdAsync(int studyPlanId)
        {
            var userId = _currentUserService.UserId;
            var courses = await _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.StudyPlan)
                .Where(c => c.StudyPlanId == studyPlanId && c.StudyPlan!.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<SimpleResponseCourseDto>>(courses);
        }

        public async Task<ResponseCourseDto?> GetCourseByIdAsync(int courseId)
        {
            var userId = _currentUserService.UserId;

            var course = await _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.StudyPlan)
                .Include(c => c.Tasks)
                .Include(c => c.Routines)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == courseId);
            
            if (course == null) return null;
            if (course.StudyPlan == null || course.StudyPlan.UserId != userId) return null;

            return _mapper.Map<ResponseCourseDto>(course);
        }

        public async Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto courseDto)
        {
            var userId = _currentUserService.UserId;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var studyPlan = await _studyPlanService.GetStudyPlanByIdAsync(courseDto.StudyPlanId);
                var subject = await _subjectService.GetSubjectByIdAsync(courseDto.SubjectId);

                var course = _mapper.Map<Entities.Course>(courseDto);
                course.StudyPlanId = courseDto.StudyPlanId;
                course.SubjectId = courseDto.SubjectId;
                course.Name = subject?.Name ?? "Môn học mới";
                course.Credits = subject?.Credits ?? 1;

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                // Tạo routine lịch học
                var routineDto = new RequestRoutineDto(
                    Id: 0,
                    Name: $"Lịch học {course.Name}",
                    Description: $"Lịch học cho môn {course.Name} - kế hoạch học tập ${studyPlan.DisplayName}",
                    StartDate: studyPlan.StartDate,
                    EndDate: studyPlan.EndDate,
                    Type: TaskType.ClassSession,
                    CourseId: course.Id,
                    Schedules: null,
                    EventRequirementId: null
                );

                await _routineService.CreateRoutineAsync(routineDto);

                // Tạo các sự kiện tự động dựa trên SubjectType
                await GenerateAutoEventsForCourseAsync(course.Id, subject.Type);

                await _context.Entry(course).Reference(c => c.Subject).LoadAsync();
                return _mapper.Map<ResponseCourseDto>(course);
            }
            catch(Exception)
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
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if (existingCourse == null) return null;
            var studyPlan = await _studyPlanService.GetStudyPlansByUserIdAsync();
            var subject = await _subjectService.GetSubjectByIdAsync(courseDto.SubjectId);

            _mapper.Map(courseDto,existingCourse);
            existingCourse.StudyPlanId = courseDto.StudyPlanId;
            existingCourse.SubjectId = courseDto.SubjectId;
            existingCourse.Name = subject?.Name ?? "Môn học mới";
            existingCourse.Credits = subject?.Credits ?? 1;

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseCourseDto>(existingCourse);
        }

        public async Task<bool> DeleteCourseAsync(int courseId)
        {
            var userId = _currentUserService.UserId;
            var existingCourse = await _context.Courses
                .Include(c => c.StudyPlan)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            if(existingCourse == null) return false;
            if (existingCourse.StudyPlan == null || existingCourse.StudyPlan.UserId != userId) return false;
            _context.Remove(existingCourse);
            await _assetLinkService.RemoveAssetLinkByAsync(courseId, Entities.Enums.AssetLinkType.Course);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task GenerateAutoEventsForCourseAsync(int courseId, SubjectType subjectType)
        {
            // Bí kíp C#: Luôn dùng TryGetValue với Dictionary để không bao giờ bị Crash app
            if (SubjectEventRegistry.Templates.TryGetValue(subjectType, out var templates))
            {
                // Dùng LINQ Select để "đúc" từ Template thành Entity thật
                var timelineEvents = templates.Select(t => new TimelineEvent
                {
                    CourseId = courseId,
                    Title = t.Title,
                    Type = t.Type,
                    Priority = t.Priority,
                    DueDate = null
                }).ToList();

                // Bulk Insert 1 lần duy nhất xuống DB
                if (timelineEvents.Any())
                {
                    await _context.TimelineEvents.AddRangeAsync(timelineEvents);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}
