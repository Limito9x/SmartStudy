using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Jobs;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStudy.Server.Entities
{
    // Task là người giao công việc
    public class TaskItem: BaseEntity, IGraphSyncTrigger
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public string? Location { get; set; } // Địa điểm học, để hỗ trợ nhắc nhở và đánh giá sau này
        // --- PHÂN LOẠI & TRẠNG THÁI ---
        public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Pending;
        public TaskType Type { get; set; } = TaskType.SelfStudy;
        public DateTime? StatusUpdatedAt { get; set; }

        // --- KHÓA NGOẠI ---
        public int UserId { get; set; }
        public User User { get; set; }
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public int? ScheduleId { get; set; }
        public Schedule? Schedule { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public int? StudyPlanId { get; set; }
        public StudyPlan? StudyPlan { get; set; }
        // Task thuộc về 1 yêu cầu
        public int? TimelineEventId { get; set; }
        public TimelineEvent? TimelineEvent { get; set; }
        public ICollection<LogItem>? Logs { get; set; } = new List<LogItem>();
        [NotMapped] // Không tạo cột này trong DB
        public bool IsOverdue
        {
            get
            {
                // 1. Đã làm hoặc Đã hủy thì vĩnh viễn không bao giờ là Overdue
                if (Status == Enums.TaskStatus.Completed || Status == Enums.TaskStatus.Cancelled)
                    return false;

                // 2. Task dạng "Tự do" không có ngày (Backlog) -> Không có khái niệm quá hạn
                if (!StartDateTime.HasValue)
                    return false;

                // 3. SO SÁNH RULE: Nếu ngày của StartDateTime nhỏ hơn ngày hôm nay -> Đã quá hạn!
                var today = DateTime.UtcNow.AddHours(7).Date;
                return StartDateTime.Value.Date < today;
            }
        }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Task;
        }
    }
}
