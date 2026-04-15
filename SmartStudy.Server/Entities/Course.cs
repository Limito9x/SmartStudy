using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    public class Course: BaseEntity, IGraphSyncTrigger
    {
        public string Name { get; set; } = null!;
        public string? Color { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Enrolled;
        public double? TargetScore { get; set; }
        public double? FinalScore { get; set; }
        public string? Goal { get; set; }
        public int? SubjectId { get; set; }
        public Subject? Subject { get; set; }
        public int StudyPlanId { get; set; }
        public StudyPlan? StudyPlan { get; set; }
        public ICollection<TimelineEvent> TimelineEvents { get; set; } = new List<TimelineEvent>();
        public ICollection<TaskItem>? Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
        public ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Course;
        }
    }
}
