using SmartStudy.Server.Dtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class StudyPlan : TimeLineEntity
    {
        public string Name {get; set;}
        public int Order { get; set; }
        // public bool IsCurrent { get; set; }
        public StudyPlanStatus Status { get; set; } = StudyPlanStatus.Active;
        public int UserId { get; set; }
        public User? User { get; set; }

        public List<Course>? Courses { get; set; }
    }
}

