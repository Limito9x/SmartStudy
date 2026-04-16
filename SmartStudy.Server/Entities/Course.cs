using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Jobs;
using System.ComponentModel.DataAnnotations.Schema;

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
        public ICollection<Phase> Phases { get; set; } = new List<Phase>();
        [NotMapped]
        public ICollection<TaskItem> Tasks => Phases.SelectMany(p => p.Tasks).ToList();
        [NotMapped]
        public ICollection<Routine> Routines => Phases.SelectMany(p => p.Routines).ToList();
        public ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Course;
        }
    }
}
