using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class Goal: BaseEntity
    {
        public required string Name { get; set; }
        public string? Unit { get; set; }
        public float TargetValue { get; set; }
        public float CurrentValue { get; set; }
        public GoalType Type { get; set; }
        // Goal thuộc về User
        public int UserId { get; set; }
        public required User User { get; set; }
        // Thuộc về 1 learning path
        public int LearningPathId { get; set; }
        public required LearningPath LearningPath { get; set; }
        // Mỗi Goal có thể liên kết với nhiều TaskItem thông qua bảng trung gian TaskGoal
        public ICollection<Task>? Tasks { get; set; } = new List<Task>();
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
    }
}
