using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.Course
{
    public interface ICourseService
    {
        Task<List<SimpleResponseCourseDto>> GetCoursesBySemesterIdAsync(int SemesterId);
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

        public CourseService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAssetLinkService assetLinkService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _assetLinkService = assetLinkService;
            _mapper = mapper;
        }

        public async Task<List<SimpleResponseCourseDto>> GetCoursesBySemesterIdAsync(int SemesterId)
        {
            var userId = _currentUserService.UserId;
            var Courses = await _context.Courses
                .Where(ph => ph.SemesterId == SemesterId && ph.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
            return _mapper.Map<List<SimpleResponseCourseDto>>(Courses);
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
            var existingCourse = await _context.Courses.Include(c=>c.ClassTimes).FirstOrDefaultAsync(c=>c.Id==CourseId);
            if(existingCourse == null) return null;
            
            var updateConfig = new TypeAdapterConfig();
            // Tránh ghi đè toàn bộ ClassTimes, chỉ cập nhật những trường đã thay đổi
            updateConfig.ForType<RequestCourseDto, Entities.Course>()
                .Map(dest => dest.ClassTimes, src => src.ClassTimes);
            CourseDto.Adapt(existingCourse, updateConfig);

            // Xử lý riêng classtime bằng sync collection
            CollectionHelper.SyncCollection<Entities.Schedule, ScheduleDto, int>
                (
                    existingCourse.ClassTimes,
                    CourseDto.ClassTimes,
                    ct => ct.Id,
                    ctDto => ctDto.Id,
                    (ct, ctDto) =>
                    {
                        _mapper.Map(ctDto, ct);
                    },
                    ctDto =>
                    {
                        var newClassTime = _mapper.Map<Entities.Schedule>(ctDto);
                        newClassTime.CourseId = CourseId;
                        return newClassTime;
                    }
                );

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
