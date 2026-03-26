using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Dtos;
using MapsterMapper;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Services
{
    public interface ITaskService
    {
        Task<ResponseTaskDto> CreateTaskAsync(RequestTaskDto taskItemDto);
        Task<ResponseTaskDto> GetTaskByIdAsync(int taskId);
        Task<List<ResponseTaskDto>> GetTasksAsync(int?courseId,TaskStatus? status);
        Task<ResponseTaskDto> UpdateTaskInfoAsync(int taskId, RequestTaskDto taskItemDto);
        Task<ResponseTaskDto> UpdateTaskStatusAsync(int taskId, TaskStatusDto taskStatusDto);
        Task<LogDto> LogWorkAsync(int taskId, LogWorkDto dto);
        Task<bool> DeleteTaskByIdAsync(int taskId);
    }
    public class TaskService: ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly ILogService _logService;

        public TaskService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper,
            ILogService logService
            )
        {
            _context = context;
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
        public async Task<ResponseTaskDto> GetTaskByIdAsync(int taskItemId)
        {
            var userId = _currentUserService.UserId;
            var taskItem = await _context.Tasks.FindAsync(taskItemId);
            if (taskItem == null || taskItem.UserId != userId)            
                throw new KeyNotFoundException("Không tìm thấy công việc");
                
            return _mapper.Map<ResponseTaskDto>(taskItem);
        }

        public async Task<List<ResponseTaskDto>> GetTasksAsync(int?courseId,TaskStatus? status)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId);
            
            if(courseId.HasValue)
            {
                query = query.Where(t => t.CourseId == courseId.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            var tasks = await query
                .OrderBy(t => t.TaskDate)
                .ThenBy(t => t.StartTime)
                .ToListAsync();

            return _mapper.Map<List<ResponseTaskDto>>(tasks);
        }

        public async Task<ResponseTaskDto?> UpdateTaskInfoAsync(int taskId, RequestTaskDto taskItemDto)
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

        public async Task<ResponseTaskDto> UpdateTaskStatusAsync(int taskId, TaskStatusDto taskStatusDto)
        {
            var userId = _currentUserService.UserId;
            var existingTaskItem = await _context.Tasks.FindAsync(taskId);
            if (existingTaskItem == null)
            {
                throw new KeyNotFoundException("Không tìm thấy công việc");
            }
            existingTaskItem.Status = taskStatusDto.Status;

            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseTaskDto>(existingTaskItem);
        }

        public async Task<LogDto> LogWorkAsync(int taskId, LogWorkDto logWorkDto)
        {
            var userId = _currentUserService.UserId;
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingTaskItem = await _context.Tasks.FindAsync(taskId);
                if (existingTaskItem == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy công việc");
                }
                var log = _mapper.Map<Entities.LogItem>(logWorkDto);
                log.TaskId = taskId;
                log.CompletedAt = DateTime.UtcNow;
                _context.Logs.Add(log);
                await _context.SaveChangesAsync();

                if(logWorkDto.AssetIds != null && logWorkDto.AssetIds.Count > 0)
                {
                    var assets = await _context.Assets.Where(a => logWorkDto.AssetIds.Contains(a.Id)).ToListAsync();
                    foreach (var asset in assets)
                    {
                        var assetLink = new Entities.AssetLink
                        {
                            AssetId = asset.Id,
                            LinkedId = log.Id,
                            LinkedType = AssetLinkType.Log
                        };
                        _context.AssetLinks.Add(assetLink);
                    }
                }

                if (logWorkDto.markAsCompleted)
                {
                    existingTaskItem.Status = Entities.Enums.TaskStatus.Completed;
                    _context.Tasks.Update(existingTaskItem);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _mapper.Map<LogDto>(log);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteTaskByIdAsync(int taskId)
        {
            var userId = _currentUserService.UserId;
            var existingTaskItem = await _context.Tasks.FirstOrDefaultAsync(t=>t.Id==taskId);
            if (existingTaskItem == null)
            {
                return false;
            }
            
            var logIds = await _context.Logs.Where(l => l.TaskId == taskId).Select(l => l.Id).ToListAsync();
            
            await _context.CascadeSoftDeleteLinkAsync(logIds, AssetLinkType.Log);
            await _context.CascadeSoftDeleteLinkAsync(taskId, AssetLinkType.Task);
            
            if (logIds.Any())
            {
                await _context.Logs.Where(l => logIds.Contains(l.Id)).SoftDeleteBulkAsync();
            }
            
            if (existingTaskItem.Status == TaskStatus.Pending)
            {
                await _context.Tasks.Where(t => t.Id == taskId).ExecuteDeleteAsync();
            }
            else
            {
                _context.Tasks.Remove(existingTaskItem);
                await _context.SaveChangesAsync();
            }
            return true;
        }
    }
}
