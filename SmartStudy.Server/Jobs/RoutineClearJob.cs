using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

public interface IRoutineClearJob
{
    Task CleanupTasksForRoutineAsync(int routineId, bool isRoutineDeleted = false);
}

public class RoutineClearJob : IRoutineClearJob
{
    private readonly ILogger<RoutineClearJob> _logger;
    private readonly ApplicationDbContext _context;

    public RoutineClearJob(ILogger<RoutineClearJob> logger,
        ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task CleanupTasksForRoutineAsync(int routineId, bool isRoutineDeleted = false)
    {
        try
        {
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == routineId);

            if(routine == null)
            {
                _logger.LogWarning("Không tìm thấy routine với ID {RoutineId} để xóa task", routineId);
                return;
            }

            routine.IsActive = false; // Đảm bảo tạm thời đánh dấu lịch trình là không hoạt động để tránh sinh task mới trong quá trình xóa
            await _context.SaveChangesAsync();

            _logger.LogInformation("Bắt đầu tiến trình xóa task tự động");
            var tasks = _context.Tasks
                .Where(t => t.RoutineId == routineId);

            if (isRoutineDeleted)
            {
                var completedTasks = tasks.Where(t => t.Status == TaskStatus.Completed);
                await completedTasks.ExecuteUpdateAsync(s => s.SetProperty(t => t.RoutineId, (int?) null));
            }

            var unusedTasks = tasks.Where(t =>
                (t.Status!= TaskStatus.Completed && !t.Logs.Any()) ||
                t.Status == TaskStatus.Pending);

            await unusedTasks.ExecuteDeleteAsync();
        
            _logger.LogInformation("Kết thúc tiến trình xóa task tự động");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while cleaning up tasks for routine {RoutineId}", routineId);
            throw; // Rethrow để Hangfire có thể ghi nhận và retry nếu cần
        }
    }
}