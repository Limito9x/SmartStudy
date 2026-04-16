using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PhaseType
    {
        General, // Công việc chung
        ExamPrep, // Ôn thi
        Project, // Dự án
        Assignment, // Nộp bài
        Custom // Tùy chỉnh
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EventStatus
    {
        Pending, // Chưa hoàn thành
        Completed, // Đã hoàn thành
        Cancelled // Đã hủy
    }

    public enum  PriorityLevel
    {
        Low = 1,
        Medium = 2,
        High = 3
    }
    public class Phase : BaseEntity, IGraphSyncTrigger
    {
        [Required]
        public int CourseId { get; set; }
        public Course? Course { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Pending;
        [Required]
        public required string Title { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public PhaseType Type { get; set; }
        public PriorityLevel Priority { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        // Breakdown thành các yêu cầu
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Routine> Routines { get; set; } = new List<Routine>();

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Phase;
        }
    }
}

