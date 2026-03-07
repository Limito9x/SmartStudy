using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStudy.Server.Entities
{
    // Task là người giao công việc
    public class TaskItem: BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateOnly? TaskDate { get; set; }
        public TimeOnly? StartTime { get; set; }
        public int? DurationMinutes { get; set; } // Thời lượng dự kiến, để hỗ trợ tính toán nhắc nhở và đánh giá sau này
        public string? Location { get; set; } // Địa điểm học, để hỗ trợ nhắc nhở và đánh giá sau này
        // --- PHÂN LOẠI & TRẠNG THÁI ---
        public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Pending;
        public TaskType Type { get; set; } = TaskType.SelfStudy;

        // --- KHÓA NGOẠI ---
        public int UserId { get; set; }
        public User User { get; set; }
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public int? ScheduleId { get; set; }
        public Schedule? Schedule { get; set; }
        public int CourseId { get; set; }
        public Course Course { get; set; }
        // Task thuộc về 1 yêu cầu
        public int? EventRequirementId { get; set; }
        public EventRequirement? EventRequirement { get; set; }
        public LogItem? Log { get; set; }
        [NotMapped] // Không tạo cột này trong DB
        public bool IsOverdue
        {
            get
            {
                // 1. Đã làm hoặc Đã hủy thì vĩnh viễn không bao giờ là Overdue
                if (Status == Enums.TaskStatus.Completed || Status == Enums.TaskStatus.Cancelled)
                    return false;

                // 2. Task dạng "Tự do" không có ngày (Backlog) -> Không có khái niệm quá hạn
                if (!TaskDate.HasValue)
                    return false;

                // 3. SO SÁNH RULE: Nếu TaskDate nhỏ hơn ngày hôm nay -> Đã quá hạn!
                var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7)); // Nhớ cộng múi giờ VN
                return TaskDate.Value < today;
            }
        }
    }
}
