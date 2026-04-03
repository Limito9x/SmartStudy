using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EventType
    {
        Exam, // Thi cử
        Assignment, // Nộp bài
        Presentation, // Thuyết trình
        ProjectDeadline, // Hạn chót dự án
        Other // Khác
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
    public class TimelineEvent : BaseEntity
    {
        [Required]
        public int CourseId { get; set; }
        public Course? Course { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Pending;
        [Required]
        public required string Title { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAllDay { get; set; } = false;
        public EventType Type { get; set; }
        public PriorityLevel Priority { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        // Breakdown thành các yêu cầu
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Routine> Routines { get; set; } = new List<Routine>();
        }
}

