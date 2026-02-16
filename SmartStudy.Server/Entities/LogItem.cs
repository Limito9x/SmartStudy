using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class LogItem: BaseEntity
    {
        //public TaskLogStatus Status { get; set; }
        public string? Note { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? TimeSpent { get; set; } // Số phút dành ra 
        public ComrehensiveLevel? ComrehensiveLevel { get; set; }
        public DifficultyLevel? DifficultyLevel { get; set; }
        // Do task chỉ liên kết 1 goal, nên log chỉ 1 trường giá trị đóng góp là biết được log này thuộc về goal nào
        public float? GoalContributionValue { get; set; }
        public string[]? Artifats { get; set; } // Để tạm lưu các file liên quan đến log này
        public int TaskId { get; set; }
        public required TaskItem Task { get; set; }
    }
}
