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
                .Where(t => t.UserId == userId && t.StartDateTime.HasValue && t.StartDateTime.Value.Date == targetDate.ToDateTime(TimeOnly.MinValue).Date)
                .OrderBy(t => t.StartDateTime)
                .Select(t => new {
                    t.Name,
                    t.StartDateTime,
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
                result += $"- {task.StartDateTime:HH:mm}: {task.Name} (Trạng thái: {task.Status})\n";
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
            [Description("ID kế hoạch học tập. Co the bo trong, he thong se tu chon plan dang active.")]  int? studyPlanId = null,
            [Description("Loại công việc")]TaskType type = TaskType.SelfStudy,
        [Description("Mô tả công việc")] string? description = null)
        {
            if (!DateOnly.TryParse(dateString, out var taskDate)) {
                return "Lỗi: Ngày không hợp lệ.";
            }
            
            if(!TimeOnly.TryParse(timeString, out var startTime)) {
                return "Lỗi: Thời gian không hợp lệ.";
            }

            var startDateTime = taskDate.ToDateTime(startTime);
            var endDateTime = startDateTime.AddMinutes(duration);

            if (!studyPlanId.HasValue)
            {
                studyPlanId = await _context.StudyPlans
                    .AsNoTracking()
                    .Where(sp => sp.UserId == _currentUserService.UserId &&
                                 sp.Status == Entities.Enums.StudyPlanStatus.Active)
                    .OrderByDescending(sp => sp.UpdatedAt)
                    .Select(sp => (int?)sp.Id)
                    .FirstOrDefaultAsync();
            }

            var dto = new RequestTaskDto
                (name,description, startDateTime, endDateTime, type,null, null, studyPlanId);
            
            var response = await _taskService.CreateTaskAsync(dto);
            return $"Công việc '{response.Name}' đã được tạo thành công cho ngày {response.StartDateTime:yyyy-MM-dd}.";
        }

        [KernelFunction("get_upcoming_tasks")]
        [Description("Lay danh sach task sap toi theo khoang so ngay. Dung cho cau hoi nhu 'tu hom nay den cuoi tuan' hoac '7 ngay toi'.")]
        public async Task<string> GetUpcomingTasksAsync(
            [Description("So ngay sap toi can xem, mac dinh 7, toi da 30")] int days = 7)
        {
            var userId = _currentUserService.UserId;
            var clampedDays = Math.Clamp(days, 1, 30);
            var start = DateTime.UtcNow.AddHours(7).Date;
            var end = start.AddDays(clampedDays);

            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId &&
                            t.StartDateTime.HasValue &&
                            t.StartDateTime.Value >= start &&
                            t.StartDateTime.Value < end)
                .OrderBy(t => t.StartDateTime)
                .Select(t => new
                {
                    t.Name,
                    t.StartDateTime,
                    t.EndDateTime,
                    t.Status
                })
                .ToListAsync();

            if (!tasks.Any())
            {
                return $"Khong co lich hoc/task nao trong {clampedDays} ngay toi.";
            }

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"Lich hoc va task trong {clampedDays} ngay toi:");
            foreach (var task in tasks)
            {
                sb.AppendLine($"- {task.StartDateTime:yyyy-MM-dd HH:mm}: {task.Name} ({task.Status})");
            }

            return sb.ToString();
        }
        
        // ── PLUGIN 1: WEEKLY SUMMARY ──────────────────────────────
        [KernelFunction("get_weekly_summary")]
        [Description(
            "Lấy tổng kết tuần học của người dùng: tổng giờ học thực tế, " +
            "số task hoàn thành, mức độ hiểu bài trung bình theo từng môn. " +
            "Dùng khi người dùng hỏi về tuần này, tuần trước, hoặc muốn biết mình học hiệu quả không.")]
        public async Task<string> GetWeeklySummaryAsync(
            [Description("Ngày bất kỳ trong tuần cần xem, định dạng yyyy-MM-dd. Để trống để lấy tuần hiện tại.")] 
            string? dateString = null)
        {
            var userId = _currentUserService.UserId;
            var vnNow = DateTime.UtcNow.AddHours(7);
 
            // Tính đầu tuần (Thứ 2) và cuối tuần (CN)
            DateOnly referenceDate;
            if (string.IsNullOrEmpty(dateString) || !DateOnly.TryParse(dateString, out referenceDate))
                referenceDate = DateOnly.FromDateTime(vnNow);
 
            var dow = (int)referenceDate.DayOfWeek;
            var monday = referenceDate.AddDays(dow == 0 ? -6 : -(dow - 1));
            var sunday = monday.AddDays(6);
 
            // Lấy tất cả tasks trong tuần
            var tasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId
                    && t.StartDateTime.HasValue
                    && t.StartDateTime.Value.Date >= monday.ToDateTime(TimeOnly.MinValue)
                    && t.StartDateTime.Value.Date <= sunday.ToDateTime(TimeOnly.MinValue))
                .Include(t => t.Logs)
                .Include(t => t.Course)
                .ToListAsync();
 
            if (!tasks.Any())
                return $"Tuần {monday:dd/MM} - {sunday:dd/MM} không có task nào được lên kế hoạch.";
 
            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Status == Entities.Enums.TaskStatus.Completed);
            var cancelledTasks = tasks.Count(t => t.Status == Entities.Enums.TaskStatus.Cancelled);
            var pendingTasks = totalTasks - completedTasks - cancelledTasks;
 
            // Tổng giờ học thực tế từ logs
            var allLogs = tasks.SelectMany(t => t.Logs ?? new List<Entities.LogItem>()).ToList();
            var totalActualMinutes = allLogs.Sum(l => l.ActualDuration);
            var totalPlannedMinutes = tasks.Sum(t => t.EndDateTime.HasValue && t.StartDateTime.HasValue ? (t.EndDateTime.Value - t.StartDateTime.Value).TotalMinutes : 0);
 
            // Tổng kết theo môn
            var byCourse = tasks
                .Where(t => t.Course != null)
                .GroupBy(t => t.Course!.Name)
                .Select(g => new
                {
                    CourseName = g.Key,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(t => t.Status == Entities.Enums.TaskStatus.Completed),
                    ActualMinutes = g.SelectMany(t => t.Logs ?? new List<Entities.LogItem>())
                                     .Sum(l => l.ActualDuration),
                    AvgComprehension = g.SelectMany(t => t.Logs ?? new List<Entities.LogItem>())
                                        .Where(l => l.ComprehensionLevel.HasValue)
                                        .Select(l => (int)l.ComprehensionLevel!)
                                        .DefaultIfEmpty(0)
                                        .Average()
                })
                .OrderByDescending(g => g.ActualMinutes)
                .ToList();
 
            // Build kết quả text
            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"=== TỔNG KẾT TUẦN {monday:dd/MM} - {sunday:dd/MM/yyyy} ===");
            sb.AppendLine();
            sb.AppendLine($"TỔNG QUAN:");
            sb.AppendLine($"- Task hoàn thành: {completedTasks}/{totalTasks} ({(totalTasks > 0 ? completedTasks * 100 / totalTasks : 0)}%)");
            sb.AppendLine($"- Giờ học thực tế: {totalActualMinutes / 60}h{totalActualMinutes % 60}p");
            sb.AppendLine($"- Giờ học kế hoạch: {totalPlannedMinutes / 60}h{totalPlannedMinutes % 60}p");
 
            if (byCourse.Any())
            {
                sb.AppendLine();
                sb.AppendLine("THEO TỪNG MÔN:");
                foreach (var c in byCourse)
                {
                    var comprehensionLabel = c.AvgComprehension switch
                    {
                        >= 3 => "Advanced",
                        >= 2 => "Intermediate",
                        >= 1 => "Basic",
                        _ => "Chưa có log"
                    };
                    var completionRate = c.TotalTasks > 0 ? c.CompletedTasks * 100 / c.TotalTasks : 0;
                    sb.AppendLine($"- {c.CourseName}: {c.ActualMinutes / 60}h{c.ActualMinutes % 60}p học thực tế, " +
                                  $"{c.CompletedTasks}/{c.TotalTasks} task ({completionRate}%), " +
                                  $"hiểu bài: {comprehensionLabel}");
                }
            }
 
            // Nhận xét tổng thể
            sb.AppendLine();
            var completionRate2 = totalTasks > 0 ? completedTasks * 100 / totalTasks : 0;
            if (completionRate2 >= 80)
                sb.AppendLine("NHẬN XÉT: Tuần học rất hiệu quả! Tiếp tục duy trì.");
            else if (completionRate2 >= 50)
                sb.AppendLine("NHẬN XÉT: Tuần học ở mức trung bình. Có thể cải thiện thêm.");
            else
                sb.AppendLine("NHẬN XÉT: Tuần học chưa đạt kế hoạch. Cần xem lại ưu tiên.");
 
            return sb.ToString();
        }
 
        // ── PLUGIN 2: COURSE PROGRESS ─────────────────────────────
        [KernelFunction("get_course_progress")]
        [Description(
            "Xem tiến độ học tập của từng môn học: tổng giờ đã học, xu hướng hiểu bài theo thời gian, " +
            "so sánh các môn với nhau để biết môn nào đang tiến bộ, môn nào đang sa sút. " +
            "Dùng khi người dùng hỏi về tiến độ môn học, môn nào đang chậm, hay cần gợi ý điều chỉnh. " +
            "QUAN TRỌNG: Mặc định KHÔNG truyền tham số nào. Luôn gọi không có tham số để lấy TẤT CẢ môn. " +
            "Chỉ truyền courseName nếu người dùng hỏi rõ ràng về 1 môn cụ thể. " +
            "TUYỆT ĐỐI KHÔNG hỏi lại người dùng về courseId hay tên môn.")]
        public async Task<string> GetCourseProgressAsync(
            [Description("Tên môn học nếu muốn lọc, ví dụ 'IELTS', 'Luận văn'. Để trống để xem tất cả môn.")] 
            string? courseName = null)
        {
            var userId = _currentUserService.UserId;
            var vnNow = DateTime.UtcNow.AddHours(7);
            var today = DateOnly.FromDateTime(vnNow);
            var fourWeeksAgo = today.AddDays(-28);
 
            // Lấy courses của user trong plan Active
            var coursesQuery = _context.Courses
                .AsNoTracking()
                .Include(c => c.StudyPlan)
                .Where(c => c.StudyPlan != null && c.StudyPlan.UserId == userId
                    && c.StudyPlan.Status == Entities.Enums.StudyPlanStatus.Active);
 
            if (!string.IsNullOrEmpty(courseName))
                coursesQuery = coursesQuery.Where(c => c.Name.ToLower().Contains(courseName.ToLower()));
 
            var courses = await coursesQuery.ToListAsync();
 
            if (!courses.Any())
                return "Không tìm thấy môn học nào đang active.";
 
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("=== TIẾN ĐỘ HỌC TẬP THEO TỪNG MÔN ===");
            sb.AppendLine();
 
            foreach (var course in courses)
            {
                // Logs 4 tuần gần nhất của môn này
                var logs = await _context.Logs
                    .AsNoTracking()
                    .Include(l => l.Task)
                    .Where(l => l.Task.UserId == userId
                        && l.Task.CourseId == course.Id
                        && l.Task.StartDateTime.HasValue
                        && l.Task.StartDateTime.Value.Date >= fourWeeksAgo.ToDateTime(TimeOnly.MinValue))
                    .OrderBy(l => l.Task.StartDateTime)
                    .ToListAsync();
 
                var totalMinutes = logs.Sum(l => l.ActualDuration);
                var totalSessions = logs.Count;
 
                sb.AppendLine($"📚 {course.Name.ToUpper()}");
                if (course.Goal != null)
                    sb.AppendLine($"   Mục tiêu: {course.Goal}");
                sb.AppendLine($"   Tổng giờ học (4 tuần): {totalMinutes / 60}h{totalMinutes % 60}p ({totalSessions} buổi)");
 
                if (!logs.Any())
                {
                    sb.AppendLine($"   ⚠️  Chưa có log học tập nào trong 4 tuần qua!");
                    sb.AppendLine();
                    continue;
                }
 
                // Xu hướng hiểu bài: so sánh 2 tuần đầu vs 2 tuần sau
                var midpoint = today.AddDays(-14);
                var earlyLogs = logs.Where(l => l.Task.StartDateTime.HasValue && l.Task.StartDateTime.Value.Date < midpoint.ToDateTime(TimeOnly.MinValue)).ToList();
                var recentLogs = logs.Where(l => l.Task.StartDateTime.HasValue && l.Task.StartDateTime.Value.Date >= midpoint.ToDateTime(TimeOnly.MinValue)).ToList();
 
                var earlyAvg = earlyLogs.Where(l => l.ComprehensionLevel.HasValue)
                    .Select(l => (double)(int)l.ComprehensionLevel!)
                    .DefaultIfEmpty(0).Average();
                var recentAvg = recentLogs.Where(l => l.ComprehensionLevel.HasValue)
                    .Select(l => (double)(int)l.ComprehensionLevel!)
                    .DefaultIfEmpty(0).Average();
 
                var trend = recentAvg - earlyAvg;
                var trendLabel = trend > 0.3 ? "📈 Tiến bộ rõ rệt"
                    : trend < -0.3 ? "📉 Đang sa sút"
                    : "➡️  Ổn định";
 
                var recentCompLabel = recentAvg switch
                {
                    >= 3 => "Advanced",
                    >= 2 => "Intermediate",
                    >= 1 => "Basic",
                    _ => "Chưa rõ"
                };
 
                sb.AppendLine($"   Hiểu bài gần đây: {recentCompLabel}");
                sb.AppendLine($"   Xu hướng: {trendLabel}");
 
                // Giờ học 2 tuần gần nhất
                var recentMinutes = recentLogs.Sum(l => l.ActualDuration);
                var recentSessions = recentLogs.Count;
                sb.AppendLine($"   2 tuần gần nhất: {recentMinutes / 60}h{recentMinutes % 60}p ({recentSessions} buổi)");
 
                // Cảnh báo nếu sa sút
                if (trend < -0.3)
                    sb.AppendLine($"   ⚠️  Mức độ hiểu bài đang giảm. Nên xem lại phương pháp học.");
                else if (recentSessions == 0)
                    sb.AppendLine($"   ⚠️  Không có buổi học nào trong 2 tuần qua!");
 
                sb.AppendLine();
            }
 
            // Gợi ý tổng thể
            sb.AppendLine("=== GỢI Ý ===");
            sb.AppendLine("Dựa trên dữ liệu trên, hãy đưa ra 2-3 gợi ý cụ thể cho người dùng.");
 
            return sb.ToString();
        }
    }
}