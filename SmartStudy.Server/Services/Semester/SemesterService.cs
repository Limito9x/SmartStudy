using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.Semester
{
    public interface ISemesterService
    {
        Task<ResponseSemesterDto> CreateSemesterAsync(RequestSemesterDto SemesterDto);
        Task<List<ResponseSemesterDto>> GetSemestersByUserIdAsync();
        Task<ResponseSemesterDto?> GetSemesterByIdAsync(int SemesterId);
        Task<ResponseSemesterDto?> UpdateSemesterAsync(int SemesterId, RequestSemesterDto SemesterDto);
        Task<bool> DeleteSemesterAsync(int SemesterId);
        //System.Threading.Tasks.Task UpdateSemesterProgressAsync(int SemesterId);
    }
    public class SemesterService : ISemesterService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public SemesterService(
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

        public async Task<ResponseSemesterDto> CreateSemesterAsync(RequestSemesterDto SemesterDto)
        {
            var userId = _currentUserService.UserId;

            // Map DTO to Model
            var Semester = _mapper.Map<Entities.Semester>(SemesterDto);
            Semester.UserId = userId;

            // Gán UserId cho tất cả Course con nếu có
            if (Semester.Courses != null && Semester.Courses.Any())
            {
                foreach (var Course in Semester.Courses)
                {
                    Course.UserId = userId;
                }
            }
            // Add to DB
            await _context.Semesters.AddAsync(Semester);
            // Save changes
            await _context.SaveChangesAsync();
            // Return DTO
            return _mapper.Map<ResponseSemesterDto>(Semester);
        }

        public async Task<ResponseSemesterDto?> GetSemesterByIdAsync(int SemesterId)
        {
            var userId = _currentUserService.UserId;
            var Semester = await _context.Semesters
                .Include(p => p.Courses)
                .FirstOrDefaultAsync(p => p.Id == SemesterId);
            if (Semester == null) return null;
            _currentUserService.CheckAuthorized(Semester.UserId, nameof(Entities.Semester));
            return _mapper.Map<ResponseSemesterDto>(Semester);
        }

        public async Task<List<ResponseSemesterDto>> GetSemestersByUserIdAsync()
        {
            var userId = _currentUserService.UserId;
            var Semesters = await _context.Semesters
                .Include(p => p.Courses)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return _mapper.Map<List<ResponseSemesterDto>>(Semesters);
        }

        public async Task<ResponseSemesterDto?> UpdateSemesterAsync(int SemesterId, RequestSemesterDto SemesterDto)
        {
            var userId = _currentUserService.UserId;
            var Semester = await _context.Semesters.Include(p=>p.Courses).FirstOrDefaultAsync(p => p.Id == SemesterId);
            if (Semester == null) return null;
            
            _mapper.Map(SemesterDto, Semester); // Map đè dữ liệu mới cho Semester
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseSemesterDto>(Semester);
        }

        public async Task<bool> DeleteSemesterAsync(int SemesterId)
        {
            var userId = _currentUserService.UserId;
            var Semester = await _context.Semesters.FirstOrDefaultAsync(p => p.Id == SemesterId);
            if (Semester == null) return false;
            await _assetLinkService.RemoveAssetLinkByAsync(SemesterId, AssetLinkType.Semester);
            _context.Semesters.Remove(Semester);
            await _context.SaveChangesAsync();
            return true;
        }

        //public async System.Threading.Tasks.Task UpdateSemesterProgressAsync(int SemesterId)
        //{
        //    var Semester = await _context.Semesters
        //        .Include(p => p.Courses)
        //        .FirstOrDefaultAsync(p => p.Id == SemesterId);
        //    if (Semester == null) return;
        //    Semester.Progress = Semester.Courses != null && Semester.Courses.Any()
        //        ? Semester.Courses.Average(Course => Course.Progress ?? 0)
        //        : 0;
        //    await _context.SaveChangesAsync();
        //}
    }
}