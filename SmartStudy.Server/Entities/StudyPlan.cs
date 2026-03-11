using SmartStudy.Server.Dtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartStudy.Server.Entities
{
    public class StudyPlan : TimeLineEntity
    {
        [Required]
        public int AcademicYearId { get; set; }
        public AcademicYear? AcademicYear { get; set; }

        [Required]
        public int AcademicTermId { get; set; }
        public AcademicTerm? AcademicTerm { get; set; }

        public int? MaxCredits { get; set; }
        public int Order { get; set; }
        // public bool IsCurrent { get; set; }
        // public StudyPlanStatus Status { get; set; } = StudyPlanStatus.Planning;

        public int UserId { get; set; }
        public User? User { get; set; }

        public List<Course>? Courses { get; set; }
        [NotMapped]
        public int TotalCredits => Courses?.Sum(c => c.Credits) ?? 0;
    }
}

