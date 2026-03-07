using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class Routine: BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public TaskType Type { get; set; } = TaskType.SelfStudy;
        public DateTime StartDate = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public DateTime NextOccurrence { get; set; }
        public int UserId { get; set; }
        public required User User { get; set; }
        public int CourseId { get; set; }
        public Course Course { get; set; }
        public int? EventRequirementId { get; set; }
        public EventRequirement? EventRequirement { get; set; }
        // Các Task do Routine tạo ra
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        // Routine có nhiều khung giờ
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }
}
