using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace SmartStudy.Server.Entities
{
    public class Semester: TimeLineEntity
    {
        [Required]
        public required string Name { get; set; }
        public TermType Term { get; set; }
        [Required]
        public int Year { get; set; }
        public bool IsCurrent { get; set; }
        public float TargetGPA { get; set; }
        public float CurrentGPA { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public List<Course>? Courses { get; set; }
    }
}
