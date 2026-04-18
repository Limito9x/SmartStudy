using Hangfire;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services
{
    public interface IStudyPlanService
    {
        Task<ResponseStudyPlanDto> CreateStudyPlanAsync(RequestStudyPlanDto studyPlanDto);
        Task<List<ResponseStudyPlanDto>> GetStudyPlansByUserIdAsync(bool? isActive);
        Task<ResponseStudyPlanDto?> GetStudyPlanByIdAsync(int studyPlanId);
        Task<ResponseStudyPlanDto?> UpdateStudyPlanAsync(int studyPlanId, RequestStudyPlanDto studyPlanDto);
        Task<bool> DeleteStudyPlanAsync(int studyPlanId);
        Task<SummaryPlanProgressDto> GetSummaryPlanProgressAsync();
        Task UpdateStudyPlanStatusAsync(int planId, UpdateStudyPlanStatusDto dto);
        Task<StudyPlanStatsDto> GetStudyPlanStatsAsync(int planId);
        Task<AcademicContextDto> GetAcademicContextAsync();
    }

    public class StudyPlanService : IStudyPlanService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public StudyPlanService(
            ApplicationDbContext context,
            IAssetLinkService assetLinkService,
            ICurrentUserService currentUserService,
            IMapper mapper
        )
        {
            _context = context;
            _assetLinkService = assetLinkService;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ResponseStudyPlanDto> CreateStudyPlanAsync(RequestStudyPlanDto studyPlanDto)
        {
            var userId = _currentUserService.UserId;
            
            if(studyPlanDto.Type==StudyPlanType.Personal&&studyPlanDto.Name==null)
                throw new ArgumentException("Name không được để trống cho KHHT cá nhân");

            var studyPlan = _mapper.Map<Entities.StudyPlan>(studyPlanDto);

            if (studyPlan.Type == StudyPlanType.Academic)
            {
                if(studyPlanDto.TermId == null ||  studyPlanDto.YearId == null)
                    throw new ArgumentException("TermId và YearId không được để trống cho KHHT học thuật");
                
                var term = await _context.AcademicTerms.FindAsync(studyPlanDto.TermId.Value);
                var year = await _context.AcademicYears.FindAsync(studyPlanDto.YearId.Value);

                if (term == null || year == null)
                    throw new ArgumentException("Term hoặc Year không hợp lệ cho KHHT học thuật");

                var existingPlan = await _context.StudyPlans
                    .FirstOrDefaultAsync(sp => sp.UserId == userId 
                                               && sp.Type == StudyPlanType.Academic
                                               && sp.TermId == studyPlanDto.TermId
                                               && sp.YearId == studyPlanDto.YearId);

                if (existingPlan != null)
                {
                    throw new InvalidOperationException($"Đã tồn tại KHHT học thuật cho Học kỳ {term.TermNumber} Năm {year.StartYear}-{year.EndYear}");
                }

                var name = $"HK {term.TermNumber} {year.StartYear} - {year.EndYear}";
                studyPlan.Name = name;
            }
            
            studyPlan.UserId = userId;
            _context.StudyPlans.Add(studyPlan);
            await _context.SaveChangesAsync();

            var spList = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();
                await _context.SaveChangesAsync();

            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<ResponseStudyPlanDto?> GetStudyPlanByIdAsync(int studyPlanId)
        {
            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .FirstOrDefaultAsync(p => p.Id == studyPlanId);
            if (studyPlan == null) return null;

            _currentUserService.CheckAuthorized(studyPlan.UserId, nameof(Entities.StudyPlan));
            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<List<ResponseStudyPlanDto>> GetStudyPlansByUserIdAsync(bool? isActive)
        {
            var userId = _currentUserService.UserId;
            
            var query = _context.StudyPlans
                .Include(p => p.Courses)
                .ThenInclude(c => c.Subject)
                .Where(p => p.UserId == userId);

            if (isActive.HasValue)
            {
                query = isActive.Value?
                    query.Where(p => p.Status == StudyPlanStatus.Active) :
                    query.Where(p => p.Status != StudyPlanStatus.Active);
            }
            
            var studyPlans = await query
                .OrderBy(p => p.StartDate)
                .ToListAsync();

            var dto = _mapper.Map<List<ResponseStudyPlanDto>>(studyPlans);
            foreach (var sp in dto)
            {
                if (sp.Type != StudyPlanType.Academic)
                {
                    sp.TotalCredits = 0;
                    sp.GPA = 0;
                    continue;
                }

                sp.TotalCredits = sp.Courses.Sum(c => c.Subject?.Credits ?? 0);

                var totalGradePoints = sp.Courses.Sum(c =>
                {
                    var credits = c.Subject?.Credits;
                    if (!credits.HasValue || !c.FinalScore.HasValue)
                    {
                        return 0;
                    }

                    return credits.Value * c.FinalScore.Value;
                });

                sp.GPA = sp.TotalCredits > 0 ? (totalGradePoints / sp.TotalCredits/10*4) : 0;
            }
            return dto;
        }

        public async Task<ResponseStudyPlanDto?> UpdateStudyPlanAsync(int studyPlanId, RequestStudyPlanDto studyPlanDto)
        {
            var userId = _currentUserService.UserId;

            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .FirstOrDefaultAsync(p => p.Id == studyPlanId);
            if (studyPlan == null) return null;

            _mapper.Map(studyPlanDto, studyPlan);

            await _context.SaveChangesAsync();

            var spList = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();
                    await _context.SaveChangesAsync();

            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<bool> DeleteStudyPlanAsync(int studyPlanId)
        {
            var userId = _currentUserService.UserId;
            bool isDeleted = false;

            var studyPlan = await _context.StudyPlans.FindAsync(studyPlanId);
            if (studyPlan == null) return false;

            var futureRoutines = await _context.Routines
                .Where(r => r.IsActive
                            && r.Phase != null
                            && r.Phase.Course != null
                            && r.Phase.Course.StudyPlanId == studyPlanId)
                .Select(r => r.Id)
                .ToListAsync();

                
             await DisableAllTasksAsync(studyPlanId);

             foreach (var routineId in futureRoutines)
             {
                 BackgroundJob.Enqueue<IRoutineClearJob>(
                     job => job.CleanupTasksForRoutineAsync(routineId, isRoutineDeleted: true) 
                 );
             }

             await _context.Courses
                .Where(c => c.StudyPlanId == studyPlanId)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.StudyPlanId, (int?) null));

            _context.StudyPlans.Remove(studyPlan);
            await _context.SaveChangesAsync();
             isDeleted = true;

            return isDeleted;
        }
        
        public async Task UpdateStudyPlanStatusAsync(int planId, UpdateStudyPlanStatusDto dto)
        {
            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .FirstOrDefaultAsync(p => p.Id == planId);
            if (studyPlan == null) return;
            _currentUserService.CheckAuthorized(studyPlan.UserId, nameof(Entities.StudyPlan));

            if (dto.Status != StudyPlanStatus.Active)
            {
                if (studyPlan.Courses != null)
                {
                    var courseStatusToUpdate = CourseStatus.Completed;
                    if(dto.Status==StudyPlanStatus.Archived)
                        courseStatusToUpdate = CourseStatus.Dropped;
                    foreach (var course in studyPlan.Courses.Where(c => c.Status == CourseStatus.Enrolled))
                    {
                        course.Status = courseStatusToUpdate;
                    }
                }
                
                await DisableAllTasksAsync(planId);

                var routinesToDisable = await _context.Routines
                    .Where(r => r.IsActive
                                && r.Phase != null
                                && r.Phase.Course != null
                                && r.Phase.Course.StudyPlanId == planId)
                    .Select(r => r.Id)
                    .ToListAsync();

                foreach (var routineId in routinesToDisable)
                {
                    BackgroundJob.Enqueue<IRoutineClearJob>(
                        job => job.CleanupTasksForRoutineAsync(routineId) 
                    );
                }
            }

            studyPlan.Status = dto.Status;

            await _context.SaveChangesAsync();
        }

        public async Task<StudyPlanStatsDto> GetStudyPlanStatsAsync(int planId)
        {
            var plan = await _context.StudyPlans
                .Include(p => p.Courses)
                    .ThenInclude(c => c.Phases)
                        .ThenInclude(ph => ph.Routines)
                            .ThenInclude(r => r.Schedules)
                .Include(p => p.Courses)
                    .ThenInclude(c => c.Phases)
                        .ThenInclude(ph => ph.Tasks)
                .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == _currentUserService.UserId);

            if (plan == null) throw new KeyNotFoundException("Không tìm thấy KHHT");

            int planTotalExpectations = 0;
            int planTotalCompletions = 0;
            int planInProgress = 0;
            int planOverdue = 0;

            var now = DateTime.UtcNow.AddHours(7);
            var today = DateOnly.FromDateTime(now);

            foreach (var course in plan.Courses)
            {
                var courseStats = StudyProgressHelper.CalculateCourseProgress(course);

                planTotalExpectations += courseStats.TotalExpectations;
                planTotalCompletions += courseStats.TotalCompletions;

                // Aggregate tasks qua Phases (Course.Tasks là [NotMapped])
                var allCourseTasks = course.Phases.SelectMany(ph => ph.Tasks).ToList();
                planInProgress += allCourseTasks.Count(t => t.Status == TaskStatus.InProgress);
                planOverdue += allCourseTasks.Count(t => t.StartDateTime.HasValue
                                    && t.StartDateTime.Value.Date < now.Date
                                    && t.Status != TaskStatus.Completed
                                    && t.Status != TaskStatus.Cancelled);
            }

            return new StudyPlanStatsDto
            {
                TotalTasks = planTotalExpectations,
                CompletedTasks = planTotalCompletions,
                InProgressTasks = planInProgress,
                OverdueTasks = planOverdue,
                PendingTasks = Math.Max(0, planTotalExpectations - (planTotalCompletions + planInProgress + planOverdue)),
                DaysLeft = plan.EndDate.HasValue
                ? Math.Max(0, (plan.EndDate.Value - now).Days)
                : 0,
                TotalStudyHours = await _context.Logs
                .Where(l => l.Task.Phase != null && l.Task.Phase.Course != null && l.Task.Phase.Course.StudyPlanId == planId)
                .SumAsync(l => (double?)l.ActualDuration ?? 0) / 60.0
            };
        }

        public async Task<AcademicContextDto> GetAcademicContextAsync()
        {
            var userId = _currentUserService.UserId;
            var studentInfo = await _context.StudentInfos.FirstOrDefaultAsync(s => s.UserId == userId);
            
            var terms = await _context.AcademicTerms.OrderBy(t => t.TermNumber).ToListAsync();
            var yearQuery = _context.AcademicYears
                .Where(y => y.StartYear <= DateTime.UtcNow.Year);
            
            if(studentInfo is { AdmissionYear: not null })
            {
                yearQuery = yearQuery.Where(y => y.StartYear >= studentInfo.AdmissionYear.Value);
            }

            var years = await yearQuery.OrderByDescending(y => y.StartYear).ToListAsync();

            var dto = new AcademicContextDto
            {
                Terms = terms,
                Years = years
            };
            
            return dto;
        }

        private async Task DisableAllTasksAsync(int studyPlanId)
        {
            // 1. Lấy danh sách ID của các khóa học thuộc Plan này
            var courseIds = await _context.Courses
                .Where(c => c.StudyPlanId == studyPlanId)
                .Select(c => c.Id)
                .ToListAsync();

            if (!courseIds.Any()) return; // Không có môn nào thì thôi, khỏi update

            // 2. Quét TẤT CẢ các Task thuộc các môn này mà CHƯA đóng
            var tasksToArchive = _context.Tasks
                .Where(t => t.Phase != null && t.Phase.CourseId != 0 
                            && courseIds.Contains(t.Phase.CourseId) // Lọc qua mảng ID (cực kỳ an toàn)
                            && t.Status != TaskStatus.Completed 
                            && t.Status != TaskStatus.Cancelled
                            && t.Status != TaskStatus.Archived);

            // 3. Update siêu tốc
            await tasksToArchive.ExecuteUpdateAsync(s => s.SetProperty(t => t.Status, TaskStatus.Archived));
        }

        public async Task<SummaryPlanProgressDto> GetSummaryPlanProgressAsync()
        {
            var userId = _currentUserService.UserId;

            // 1. Lấy tất cả các môn đã hoàn thành từ tất cả StudyPlan (cả Active và Archived) của User này
            // để tính toán tích lũy toàn khóa.
            var allCompletedCourses = await _context.Courses
                .Include(c => c.Subject)
                .Where(c => c.StudyPlan.UserId == userId 
                            && c.StudyPlan.Type == StudyPlanType.Academic
                            && c.Status == CourseStatus.Completed
                            && c.FinalScore.HasValue 
                            && c.SubjectId.HasValue)
                .ToListAsync();

            if (!allCompletedCourses.Any())
            {
                return new SummaryPlanProgressDto { TotalCredits = 0, GPA = 0 };
            }

            // 2. Xử lý trùng môn: Nhóm theo SubjectId và chỉ lấy bản ghi có FinalScore cao nhất (điểm cải thiện)
            var distinctCourses = allCompletedCourses
                .GroupBy(c => c.SubjectId)
                .Select(g => g.OrderByDescending(c => c.FinalScore).First())
                .ToList();

            // 3. Tính toán trên danh sách đã lọc trùng
            var totalCredits = distinctCourses
                .Sum(c => c.Subject?.Credits ?? 0);

            var totalGradePoints = distinctCourses
                .Sum(c =>
                {
                    var credits = c.Subject?.Credits;
                    if (!credits.HasValue || !c.FinalScore.HasValue)
                    {
                        return 0;
                    }

                    return credits.Value * c.FinalScore.Value;
                });

            return new SummaryPlanProgressDto
            {
                TotalCredits = totalCredits,
                // Chỗ này nên để double, nếu DTO của bạn là int thì hãy làm tròn, 
                // nhưng GPA thường là decimal/double (VD: 3.2)
                GPA = totalCredits > 0 ? Math.Round(totalGradePoints / totalCredits/10*4, 2) : 0
            };
        }
    }
}

