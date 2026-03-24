using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services
{
    public interface IStudyPlanService
    {
        Task<ResponseStudyPlanDto> CreateStudyPlanAsync(RequestStudyPlanDto studyPlanDto);
        Task<List<ResponseStudyPlanDto>> GetStudyPlansByUserIdAsync(bool? isActive);
        Task<ResponseStudyPlanDto?> GetStudyPlanByIdAsync(int studyPlanId);
        Task<ResponseStudyPlanDto?> UpdateStudyPlanAsync(int studyPlanId, RequestStudyPlanDto studyPlanDto);
        Task<bool> DeleteStudyPlanAsync(int studyPlanId);
        Task BulkSetupStudyPlansAsync(BulkCreateStudyPlanDto dto);
        //Task SyncDraftCoursesAsync(int planId, SyncDraftCoursesDto dto);
        //Task CommitStudyPlanAsync(int planId);
        Task UpdateStudyPlanStatusAsync(int planId, UpdateStudyPlanStatusDto dto);
    }

    public class StudyPlanService : IStudyPlanService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IRoutineService _routineService;
        private readonly IMapper _mapper;

        public StudyPlanService(
            ApplicationDbContext context,
            IAssetLinkService assetLinkService,
            ICurrentUserService currentUserService,
            IRoutineService routingService,
            IMapper mapper
        )
        {
            _context = context;
            _assetLinkService = assetLinkService;
            _currentUserService = currentUserService;
            _routineService = routingService;
            _mapper = mapper;
        }

        public async Task<ResponseStudyPlanDto> CreateStudyPlanAsync(RequestStudyPlanDto studyPlanDto)
        {
            var userId = _currentUserService.UserId;

            var studyPlan = _mapper.Map<Entities.StudyPlan>(studyPlanDto);
            studyPlan.UserId = userId;
            _context.StudyPlans.Add(studyPlan);
            await _context.SaveChangesAsync();

            var spList = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();
                ReorderStudyPlans(spList);
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

            return _mapper.Map<List<ResponseStudyPlanDto>>(studyPlans);
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
                    ReorderStudyPlans(spList);
                    await _context.SaveChangesAsync();

            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<bool> DeleteStudyPlanAsync(int studyPlanId)
        {
            var userId = _currentUserService.UserId;
            bool isDeleted = false;

            var studyPlan = await _context.StudyPlans.FindAsync(studyPlanId);
            if (studyPlan == null) return false;

            _context.StudyPlans.Remove(studyPlan);
            await _context.SaveChangesAsync();
             isDeleted = true;

            var spList = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();
                    ReorderStudyPlans(spList);
                    await _context.SaveChangesAsync();

            if (isDeleted) await _assetLinkService.RemoveAssetLinkByAsync(studyPlanId, AssetLinkType.StudyPlan);

            return isDeleted;
        }

        private void ReorderStudyPlans(List<Entities.StudyPlan> plans)
        {
            // Sắp xếp theo ngày bắt đầu
            var sortedPlans = plans.OrderBy(s => s.StartDate).ToList();

            // Đánh lại số thứ tự
            for (int i = 0; i < sortedPlans.Count; i++)
            {
                sortedPlans[i].Order = i + 1;
            }
        }

        public async Task BulkSetupStudyPlansAsync(BulkCreateStudyPlanDto dtos)
        {
            var userId = _currentUserService.UserId;

            // 1. Dọn rác cũ (Nếu dùng EF 7/8 thì xài ExecuteDeleteAsync cho lẹ)
            var oldPlans = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();
            _context.StudyPlans.RemoveRange(oldPlans);

            // 2. Map data mới
            var newPlans = _mapper.Map<List<Entities.StudyPlan>>(dtos.StudyPlans);
            newPlans.ForEach(p => p.UserId = userId);

            // 3. TÁI SỬ DỤNG HÀM ĐÁNH SỐ Ở ĐÂY
            ReorderStudyPlans(newPlans);

            // 4. Lưu vào DB
            _context.StudyPlans.AddRange(newPlans);
            await _context.SaveChangesAsync();
        }

        //public async Task SyncDraftCoursesAsync(int planId, SyncDraftCoursesDto dto)
        //{
        //    var studyPlan = await _context.StudyPlans.Include(sp=>sp.Courses).FirstOrDefaultAsync(p => p.Id == planId);
        //    if (studyPlan == null) return;
        //    _currentUserService.CheckAuthorized(studyPlan.UserId, nameof(Entities.StudyPlan));

        //    var courses = studyPlan.Courses;
        //    if(courses!=null && courses.Count>0)
        //    {
        //        foreach (var course in courses)
        //        {
        //            if (dto.SelectedCourseIds.Contains(course.Id))
        //            {
        //                course.Status = CourseStatus.Enrolled;
        //            }
        //            else
        //            {
        //                course.Status = CourseStatus.Draft;
        //            }
        //        }
        //    }    
        

        public async Task UpdateStudyPlanStatusAsync(int planId, UpdateStudyPlanStatusDto dto)
        {
            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .FirstOrDefaultAsync(p => p.Id == planId);
            if (studyPlan == null) return;
            _currentUserService.CheckAuthorized(studyPlan.UserId, nameof(Entities.StudyPlan));

            if (studyPlan.Courses != null)
            {
                foreach (var course in studyPlan.Courses.Where(c => c.Status == CourseStatus.Enrolled))
                {
                    course.Status = CourseStatus.Completed;
                }
            }

            await _context.SaveChangesAsync();
        }

        // private async Task PurgeDraftCoursesAsync(int planId)
        // {
        //     var drafts = await _context.Courses
        //         .Where(c => c.StudyPlanId == planId && c.Status == CourseStatus.Draft)
        //         .ExecuteDeleteAsync();
        // }

        //private List<TimelineEvent>? GenerateAutoEventsForCourseAsync(int courseId, SubjectType subjectType)
        //{
        //    // Bí kíp C#: Luôn dùng TryGetValue với Dictionary để không bao giờ bị Crash app
        //    if (SubjectEventRegistry.Templates.TryGetValue(subjectType, out var templates))
        //    {
        //        // Dùng LINQ Select để "đúc" từ Template thành Entity thật
        //        var timelineEvents = templates.Select(t => new TimelineEvent
        //        {
        //            CourseId = courseId,
        //            Title = t.Title,
        //            Type = t.Type,
        //            Priority = t.Priority,
        //            DueDate = null
        //        }).ToList();
                
        //        return timelineEvents;
        //    }
            
        //    return null;
        //}
    }
}

