using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    // Nơi lưu giữ "công thức" quy tắc biết rằng Task nào hoặc Routine nào sẽ đóng góp vào Goal nào hoặc Grade nào
    public class EventRequirement: BaseEntity
    {
        public required string Name { get; set; }

        // Chiến lược & Kỳ vọng
        public float ExpectedValue { get; set; }     // Vd: 3 (đề) hoặc 600 (phút)
        public string Unit { get; set; }             // Vd: "Đề", "Phút", "Trang"
        public RequirementStrategy Strategy { get; set; } = RequirementStrategy.TaskBased;
        public int TimelineEventId { get; set; }
        // Khóa ngoại
        public TimelineEvent TimelineEvent { get; set; } 
        // Collection
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}
