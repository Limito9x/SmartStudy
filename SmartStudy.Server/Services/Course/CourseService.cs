using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Services.Semester;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.Course
{
    public interface ICourseService
    {

        Task<ResponseCourseDto?> GetCourseByIdAsync(int CourseId);
        Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto CourseDto);
        Task<ResponseCourseDto?> UpdateCourseAsync(int CourseId, RequestCourseDto CourseDto);
        Task<bool> DeleteCourseAsync(int CourseId);
        //Task UpdateCourseProgressAsync(int CourseId);
    }
    public class CourseService: ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAssetLinkService _assetLinkService;
        private readonly IMapper _mapper;
        private readonly ISemesterService _SemesterService;

        public CourseService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAssetLinkService assetLinkService,
            IMapper mapper,
            ISemesterService SemesterService
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _assetLinkService = assetLinkService;
            _mapper = mapper;
            _SemesterService = SemesterService;
        }

        public async Task<ResponseCourseDto?> GetCourseByIdAsync(int CourseId)
        {
            var Course = await _context.Courses
                .Include(ph => ph.Tasks)
                .Include(ph => ph.Routines)
                .AsNoTracking()
                .FirstOrDefaultAsync(ph => ph.Id == CourseId);
            
            if(Course == null) return null;
            return _mapper.Map<ResponseCourseDto>(Course);
        }

        public async Task<ResponseCourseDto> CreateCourseAsync(RequestCourseDto CourseDto)
        {
            var userId = _currentUserService.UserId;
            var Course = _mapper.Map<Entities.Course>(CourseDto);
            Course.UserId = userId;
            _context.Courses.Add(Course);
            await  _context.SaveChangesAsync();
            return _mapper.Map<ResponseCourseDto>(Course);
        }

        public async Task<ResponseCourseDto?> UpdateCourseAsync(int CourseId, RequestCourseDto CourseDto)
        {
            var existingCourse = await _context.Courses.FindAsync(CourseId);
            if(existingCourse == null) return null;
            _mapper.Map(CourseDto, existingCourse);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseCourseDto>(existingCourse);
        }

        public async Task<bool> DeleteCourseAsync(int CourseId)
        {
            var existingCourse = await _context.Courses.FindAsync(CourseId);
            if(existingCourse == null) return false;
            _context.Remove(existingCourse);
            await _assetLinkService.RemoveAssetLinkByAsync(CourseId, Entities.Enums.AssetLinkType.Course);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
