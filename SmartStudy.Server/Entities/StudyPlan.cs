using System.ComponentModel.DataAnnotations;

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

        public int Order { get; set; }
        public bool IsCurrent { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public List<Course>? Courses { get; set; }
    }
}

