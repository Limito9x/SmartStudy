namespace SmartStudy.Server.Entities
{
    public enum PathStatus
    {
        InProgress,
        Completed,
        OnHold,
        Dropped
    }
    // Lộ trình học cá nhân ngoài chương trình học chính
    public class LearningPath : TimeLineEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public PathStatus Status { get; set; } = PathStatus.InProgress;
        public int UserId { get; set; }
        public required User User { get; set; }
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
        public ICollection<TaskItem>? Tasks { get; set; } = new List<TaskItem>();
        public int MainGoalId { get; set; }
        public required Goal MainGoal { get; set; }
        public ICollection<Goal>? SubGoals { get; set; } = new List<Goal>();
    }
}
