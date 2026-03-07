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
        Task<List<ResponseStudyPlanDto>> GetStudyPlansByUserIdAsync();
        Task<ResponseStudyPlanDto?> GetStudyPlanByIdAsync(int studyPlanId);
        Task<ResponseStudyPlanDto?> UpdateStudyPlanAsync(int studyPlanId, RequestStudyPlanDto studyPlanDto);
        Task<bool> DeleteStudyPlanAsync(int studyPlanId);
        Task BulkSetupStudyPlansAsync(int userId, List<RequestStudyPlanDto> dtos);
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

            var studyPlan = _mapper.Map<Entities.StudyPlan>(studyPlanDto);
            studyPlan.UserId = userId;

            await ProcessStudyPlanChangesAsync(studyPlan.UserId, list =>
            {
                list.Add(studyPlan);
                _context.StudyPlans.Add(studyPlan);
            });

            await _context.Entry(studyPlan).Reference(x => x.AcademicTerm).LoadAsync();
            await _context.Entry(studyPlan).Reference(x => x.AcademicYear).LoadAsync();

            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<ResponseStudyPlanDto?> GetStudyPlanByIdAsync(int studyPlanId)
        {
            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .Include(p => p.AcademicTerm)
                .Include(p => p.AcademicYear)
                .FirstOrDefaultAsync(p => p.Id == studyPlanId);
            if (studyPlan == null) return null;

            _currentUserService.CheckAuthorized(studyPlan.UserId, nameof(Entities.StudyPlan));
            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<List<ResponseStudyPlanDto>> GetStudyPlansByUserIdAsync()
        {
            var userId = _currentUserService.UserId;

            var studyPlans = await _context.StudyPlans
                .Include(p => p.Courses)
                .Include(p => p.AcademicTerm)
                .Include(p => p.AcademicYear)
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.StartDate)
                .ToListAsync();

            return _mapper.Map<List<ResponseStudyPlanDto>>(studyPlans);
        }

        public async Task<ResponseStudyPlanDto?> UpdateStudyPlanAsync(int studyPlanId, RequestStudyPlanDto studyPlanDto)
        {
            var userId = _currentUserService.UserId;

            var studyPlan = await _context.StudyPlans
                .Include(p => p.Courses)
                .Include(p => p.AcademicTerm)
                .Include(p => p.AcademicYear)
                .FirstOrDefaultAsync(p => p.Id == studyPlanId);
            if (studyPlan == null) return null;

            _mapper.Map(studyPlanDto, studyPlan);

            await ProcessStudyPlanChangesAsync(userId, list =>
            {
                var target = list.FirstOrDefault(s => s.Id == studyPlanId);
                if (target != null)
                {
                    _mapper.Map(studyPlanDto, target);
                }
            });

            return _mapper.Map<ResponseStudyPlanDto>(studyPlan);
        }

        public async Task<bool> DeleteStudyPlanAsync(int studyPlanId)
        {
            var userId = _currentUserService.UserId;
            bool isDeleted = false;

            await ProcessStudyPlanChangesAsync(userId, list =>
            {
                var target = list.FirstOrDefault(s => s.Id == studyPlanId);
                if (target != null)
                {
                    list.Remove(target);
                    _context.StudyPlans.Remove(target);
                    isDeleted = true;
                }
            });

            if (isDeleted) await _assetLinkService.RemoveAssetLinkByAsync(studyPlanId, AssetLinkType.StudyPlan);

            return isDeleted;
        }

        private async Task ProcessStudyPlanChangesAsync(int userId, Action<List<Entities.StudyPlan>> modifyListAction)
        {
            var allStudyPlans = await _context.StudyPlans.Where(s => s.UserId == userId).ToListAsync();

            modifyListAction(allStudyPlans);

            var sorted = allStudyPlans.OrderBy(s => s.StartDate).ToList();
            for (int i = 0; i < sorted.Count; i++)
            {
                sorted[i].Order = i + 1;
            }

            await _context.SaveChangesAsync();
        }

        public async Task BulkSetupStudyPlansAsync(int userId, List<RequestStudyPlanDto> dtos)
        {
            await ProcessStudyPlanChangesAsync(userId, list =>
            {
                _context.StudyPlans.RemoveRange(list);
                list.Clear();

                var newEntities = _mapper.Map<List<Entities.StudyPlan>>(dtos);
                foreach (var item in newEntities)
                {
                    item.UserId = userId;
                    list.Add(item);
                    _context.StudyPlans.Add(item);
                }
            });
        }
    }
}

