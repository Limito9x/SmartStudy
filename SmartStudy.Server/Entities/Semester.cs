using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace SmartStudy.Server.Entities
{
    public class Semester: TimeLineEntity
    {
        [Required]
        public required string Name { get; set; }
        public TermType Term { get; set; } // Học kỳ của trường
        public int Order { get; set; } // Thứ tự học kỳ theo lộ trình người học, phòng tránh trường hợp học lệch hoặc học linh hoạt
        [Required]
        public int Year { get; set; } // Năm học của trường
        public bool IsCurrent { get; set; }
        public float TargetGPA { get; set; }
        public float CurrentGPA { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public List<Course>? Courses { get; set; }
    }
}
