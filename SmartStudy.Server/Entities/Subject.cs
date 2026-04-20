using System.Collections.Generic;
using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations;
using SmartStudy.Server.Entities.Interfaces;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    public class Subject : BaseEntity, IGraphSyncTrigger
    {
        public string? Code { get; set; }
        public required string Name { get; set; }
        public StudyPlanType Type { get; set; } = StudyPlanType.Academic;
        public int? Credits { get; set; }
        public ICollection<Course> Courses { get; set; } = new List<Course>();
        public int UserId { get; set; }
        public User User { get; set; }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Subject;
        }
    }
}

