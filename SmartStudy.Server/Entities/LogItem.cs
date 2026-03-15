using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    // Log là người cuối cùng trong workflow
    // Ghi nhận toàn bộ sự thật về quá trình thực hiện Task
    public class LogItem: BaseEntity
    {
        //public TaskLogStatus Status { get; set; }
        public string? Note { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int ActualDuration { get; set; } // Thời lượng thực tế, để hỗ trợ đánh giá sau này
        // public int? ProductivityScore { get; set; }
        public ComprehensionLevel? ComprehensionLevel { get; set; } // Hiểu bài
        public DifficultyLevel? DifficultyLevel { get; set; } // Độ khó
        // Pomodora - Hardcore mode: log thời gian bắt đầu và kết thúc thực tế, để hỗ trợ đánh giá sau này
        public DateTime? TimerStartAt { get; set; }
        public DateTime? TimerEndAt { get; set; }
        public int TaskId { get; set; }
        public required TaskItem Task { get; set; }
        public int? EventRequirementId { get; set; }
        public float? EarnedValue { get; set; }// Bổ sung giá trị cho event requirement, để hỗ trợ đánh giá sau này
    }
}
