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

        [Required]
        public required string Title { get; set; }
        public DateTime? DueDate { get; set; }
        public EventType Type { get; set; }
        public PriorityLevel Priority { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        // Breakdown thành các yêu cầu
        ICollection<EventRequirement> EventRequirements { get; set; } = new List<EventRequirement>();
        }
}

