using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;


namespace SmartStudy.Server.Services
{
    public interface ILogService
    {
        Task<List<LogDto>> GetLogs(int? courseId);
        Task<LogDto?> GetTaskLogByIdAsync(int id);
        Task<LogDto> UpdateTaskLogAsync(int taskLogId, LogWorkDto taskLogDto);
        Task<bool> DeleteTaskLogAsync(int taskLogId);
    }
    public class LogService: ILogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICourseService _CourseService;
        public LogService(
            ApplicationDbContext context,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IAssetLinkService assetLinkService,
            ICourseService CourseService
            )
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _assetLinkService = assetLinkService;
            _CourseService = CourseService;
        }
        public async Task<LogDto> GetTaskLogByIdAsync(int Id)
        {
            var tasklog = await _context.Logs
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == Id);
            if (tasklog == null)
            {
                return null;
            }
            return _mapper.Map<LogDto>(tasklog);
        }

        public async Task<LogDto> UpdateTaskLogAsync(int taskLogId, LogWorkDto taskLogDto)
        {
            var existingTaskLog = await _context.Logs.FirstOrDefaultAsync(l=>l.Id==taskLogId);
            if (existingTaskLog == null)
            {
                return null;
            }

            var config = new TypeAdapterConfig();
            config.NewConfig<LogWorkDto, Entities.LogItem>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CompletedAt);

            taskLogDto.Adapt(existingTaskLog, config);

            await _context.SaveChangesAsync();
            return _mapper.Map<LogDto>(existingTaskLog);
        }
        public async Task<bool> DeleteTaskLogAsync(int taskLogId)
        {
            var tasklog = await _context.Logs.FindAsync(taskLogId);
            if(tasklog == null)
            {
                return false;
            }
            _context.Logs.Remove(tasklog);
            await _assetLinkService.RemoveAssetLinkByAsync(taskLogId, Entities.Enums.AssetLinkType.Log);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<LogDto>> GetLogs(int? courseId)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Logs
                .AsNoTracking()
                .Include(l => l.Task)  // thêm dòng này
                .Where(l => l.Task.UserId == userId);

            if (courseId.HasValue)
                query = query.Where(l => l.Task.Phase != null && l.Task.Phase.CourseId == courseId.Value);

            return await query
                .OrderByDescending(l => l.CompletedAt ?? l.CreatedAt)
                .ProjectToType<LogDto>()
                .ToListAsync();
        }
    }
}
