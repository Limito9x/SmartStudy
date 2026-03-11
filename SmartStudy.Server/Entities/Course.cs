using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class Course: BaseEntity
    {
        public string Name { get; set; } = null!;
        public int Credits { get; set; }
        public string? Mentor { get; set; }
        public string? AlternativeName { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
        public double? TargetScore { get; set; }
        public double? FinalScore { get; set; }
        public int StudyPlanId { get; set; }
        public StudyPlan? StudyPlan { get; set; }
        public int SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public ICollection<TimelineEvent> TimelineEvents { get; set; } = new List<TimelineEvent>();
        public ICollection<TaskItem>? Tasks { get; set; } = new List<TaskItem>();
        // Classtime giờ giao phó cho Routine
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
    }
}
