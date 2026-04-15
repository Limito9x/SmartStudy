using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    public class StudyPlan : TimeLineEntity, IGraphSyncTrigger
    {
        public string Name {get; set;}
        public StudyPlanType Type { get; set; } = StudyPlanType.Academic;
        public int Order { get; set; }
        // public bool IsCurrent { get; set; }
        public StudyPlanStatus Status { get; set; } = StudyPlanStatus.Active;
        public int UserId { get; set; }
        public User? User { get; set; }

        public List<Course>? Courses { get; set; }
        public int? TemplateId { get; set; }
        public PlanTemplate? Template { get; set; }
        public int? TermId { get; set; }
        public AcademicTerm? Term { get; set; }
        public int? YearId { get; set; }
        public AcademicYear? Year { get; set; }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.StudyPlan;
        }
    }
}

