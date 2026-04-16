using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Jobs;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStudy.Server.Entities
{
    public class Routine: BaseEntity, IGraphSyncTrigger
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Instructor { get; set; }
        public TaskType Type { get; set; } = TaskType.SelfStudy;
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int UserId { get; set; }
        public User User { get; set; }
        public int? StudyPlanId { get; set; }
        public StudyPlan? StudyPlan { get; set; }
        public int? PhaseId { get; set; }
        public Phase? Phase { get; set; }
        [NotMapped]
        public int? CourseId
        {
            get => Phase?.CourseId;
            set { }
        }
        [NotMapped]
        public Course? Course
        {
            get => Phase?.Course;
            set { }
        }
        // Các Task do Routine tạo ra
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        // Routine có nhiều khung giờ
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Routine;
        }
    }
}
