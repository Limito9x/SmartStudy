using Microsoft.SemanticKernel;
using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services; // Để lấy ICurrentUserService

namespace SmartStudy.Server.Plugins
{
    public class StudyPlugin
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly ITaskService _taskService;

        public StudyPlugin(ApplicationDbContext context, ICurrentUserService currentUserService,
            ITaskService taskService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _taskService = taskService;
        }

        [KernelFunction("get_tasks_by_date")]
        [Description("Lấy danh sách công việc, lịch học của người dùng trong MỘT NGÀY CỤ THỂ.")]
        public async Task<string> GetTodayTasksAsync(
            [Description("Ngày cần xem lịch. Bắt buộc dùng định dạng yyyy-MM-dd")] string dateString)
        {
            var userId = _currentUserService.UserId;
            
            if (!DateOnly.TryParse(dateString, out var targetDate)) {
                return "Lỗi: Ngày không hợp lệ.";
            }

            // Query cực gọn: Chỉ lấy những thứ AI cần biết
            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId && t.TaskDate == targetDate)
                .OrderBy(t => t.StartTime)
                .Select(t => new {
                    t.Name,
                    t.StartTime,
                    Status = t.Status == Entities.Enums.TaskStatus.Completed ? "Đã xong" : "Chưa làm"
                })
                .ToListAsync();

            if (!tasks.Any())
            {
                return "Vào ngày này người dùng không có lịch học hay công việc nào cả. Hãy khuyên họ nghỉ ngơi hoặc hỏi xem họ có muốn tạo kế hoạch mới không.";
            }

            // Ép ra chuỗi Text thuần túy (LLM cực kỳ thích format này, tiết kiệm token)
            var result = $"Dữ liệu lịch học ngày {targetDate}:\n";
            foreach (var task in tasks)
            {
                // Viết rõ ràng, sạch sẽ để AI dễ đọc
                result += $"- {task.StartTime}: {task.Name} (Trạng thái: {task.Status})\n";
            }

            return result;
        }

        [KernelFunction("create_task")]
        [Description(
            "Tạo một công việc mới cho người dùng. Cần cung cấp tên công việc, ngày tháng, và thời gian bắt đầu.")]
        public async Task<string> CreateTaskAsync(
            [Description("Tên công việc")] string name,
            [Description("Ngày công việc, định dạng yyyy-MM-dd")] string dateString,
            [Description("Thời gian bắt đầu, định dạng HH:mm")] string timeString,
            [Description("Thời lượng dự kiến")] int duration,
            [Description("ID kế hoạch học tập")]  int studyPlanId,
            [Description("Loại công việc")]TaskType type = TaskType.SelfStudy,
        [Description("Mô tả công việc")] string? description = null)
        {
            if (!DateOnly.TryParse(dateString, out var taskDate)) {
                return "Lỗi: Ngày không hợp lệ.";
            }
            
            if(!TimeOnly.TryParse(timeString, out var startTime)) {
                return "Lỗi: Thời gian không hợp lệ.";
            }

            var dto = new RequestTaskDto
                (name,description, taskDate, startTime, duration, type,null, studyPlanId);
            
            var response = await _taskService.CreateTaskAsync(dto);
            return $"Công việc '{response.Name}' đã được tạo thành công cho ngày {response.TaskDate}.";
        }
    }
}