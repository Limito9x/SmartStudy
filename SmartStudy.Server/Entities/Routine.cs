using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class Routine: BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Instructor { get; set; }
        public TaskType Type { get; set; } = TaskType.SelfStudy;
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public DateTime NextOccurrence { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int StudyPlanId { get; set; }
        public StudyPlan StudyPlan { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public int? TimelineEventId { get; set; }
        public TimelineEvent? TimelineEvent { get; set; }
        // Các Task do Routine tạo ra
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        // Routine có nhiều khung giờ
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }
}
