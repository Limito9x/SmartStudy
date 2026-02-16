using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class TaskItem: BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Pending;
        public TaskType Type { get; set; } = TaskType.Chores;
        public int Priority { get; set; } = 3; // Mặc định là trung bình
        public int UserId { get; set; }
        public User User { get; set; }
        // Liên kết với Routine nếu có
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public int? GoalId { get; set; } // Goal -> LearningPath
        public Goal? Goal { get; set; }
        public int? GradeId { get; set; } // Grade -> Course
        public Grade? Grade { get; set; }
        public LogItem? Log { get; set; } // Mỗi task chỉ có 1 log liên quan
    }
}
