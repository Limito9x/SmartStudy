using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services.UserService;
using SmartStudy.Server.Dtos;
using MapsterMapper;
using SmartStudy.Server.Services.TaskLog;

namespace SmartStudy.Server.Services.TaskItem
{
    public interface ITaskService
    {
        Task<ResponseTaskDto> CreateTaskAsync(RequestTaskDto taskItemDto);
        Task<ResponseTaskDto> GetTaskByIdAsync(int taskId);
        Task<ResponseTaskDto> UpdateTaskByIdAsync(int taskId, RequestTaskDto taskItemDto);
        Task<ResponseTaskDto?> ExecuteTaskByIdAsync(int taskId, ExecuteTaskDto TaskDto);
        Task<bool> DeleteTaskByIdAsync(int taskId);
    }
    public class TaskService: ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly ILogService _logService;

        public TaskService(
            ApplicationDbContext context,
            IAssetLinkService assetLinkService,
            ICurrentUserService currentUserService,
            IMapper mapper,
            ILogService logService
            )
        {
            _context = context;
            _assetLinkService = assetLinkService;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _logService = logService;
        }
        public async Task<ResponseTaskDto> CreateTaskAsync(RequestTaskDto taskItemDto)
        {
            var userId = _currentUserService.UserId;
            
            
            var Task = _mapper.Map<Entities.TaskItem>(taskItemDto);
            Task.UserId = userId;
            await _context.Tasks.AddAsync(Task);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseTaskDto>(Task);
        }
        public async Task<ResponseTaskDto?> GetTaskByIdAsync(int taskItemId)
        {
            var userId = _currentUserService.UserId;
            var taskItem = await _context.Tasks.FindAsync(taskItemId);
            if (taskItem == null)
            {
                return null;
            }
            return _mapper.Map<ResponseTaskDto>(taskItem);
        }

        public async Task<ResponseTaskDto?> UpdateTaskByIdAsync(int taskId, RequestTaskDto taskItemDto)
        {
            var userId = _currentUserService.UserId;
            var existingTaskItem = await _context.Tasks.FindAsync(taskId);
            if (existingTaskItem == null)
            {
                return null;
            }
            _mapper.Map(taskItemDto, existingTaskItem);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseTaskDto>(existingTaskItem);
        }

        public async Task<ResponseTaskDto?> ExecuteTaskByIdAsync(int taskId, ExecuteTaskDto executeTaskDto)
        {
            var userId = _currentUserService.UserId;
            var existingTaskItem = await _context.Tasks.FindAsync(taskId);
            if (existingTaskItem == null)
            {
                return null;
            }
            _mapper.Map(executeTaskDto, existingTaskItem);

            var taskLogDto = executeTaskDto.logDto with { TaskId = taskId };

            await _logService.CreateTaskLogAsync(taskLogDto);

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseTaskDto>(existingTaskItem);
        }

        public async Task<bool> DeleteTaskByIdAsync(int taskId)
        {
            var userId = _currentUserService.UserId;
            var existingTaskItem = await _context.Tasks.FirstOrDefaultAsync(t=>t.Id==taskId);
            if (existingTaskItem == null)
            {
                return false;
            }
            await _assetLinkService.RemoveAssetLinkByAsync(taskId, AssetLinkType.SINGLE_TASK);
            _context.Tasks.Remove(existingTaskItem);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
