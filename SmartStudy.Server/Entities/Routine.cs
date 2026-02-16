using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class Routine: BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public TaskType Type { get; set; } = TaskType.Chores;
        public DateTime StartDate = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public DateTime NextOccurrence { get; set; }
        public int UserId { get; set; }
        public required User User { get; set; }
        // Các Task do Routine tạo ra
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        // Routine có nhiều khung giờ
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
        // Routine có 1 mục tiêu
        // Việc này giúp cho khi tạo task từ routine thì có thể tự động tạo các goal tương ứng
        public int? GoalId { get; set; } // Goal -> LearningPath
        public Goal? Goal { get; set; }
        public int? GradeId { get; set; } // Grade -> Course
        public Grade? Grade { get; set; }
    }
}
