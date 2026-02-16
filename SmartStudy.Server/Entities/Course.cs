using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace SmartStudy.Server.Entities
{
    public class Course: TimeLineEntity
    {
        public string Name { get; set; }
        public int Credits { get; set; }
        public ICollection<Grade> Grades { get; set; } = new List<Grade>(); // Các cột điểm 
        public float TargetGrade { get; set; }
        public float ForecastGrade { get; set; }
        public int SemesterId { get; set; }
        public Semester? Semester { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        // Course không có Goal vì tập trung vào quản lý Grade
        // Các biến tính toán (NotMapped - Không lưu DB, chỉ tính khi get ra)
        [NotMapped]
        public double CurrentGPA
        {
            get
            {
                if (Grades == null || !Grades.Any()) return 0;
                // Logic tính điểm trung bình dựa trên các cột điểm đã có
                return Grades.Where(g => g.ActualScore.HasValue)
                             .Sum(g => g.ActualScore.Value * g.Weight);
            }
        }
        [NotMapped]
        public string? LetterGrade { get; set; }
        public ICollection<Schedule> ClassTimes { get; set; } = new List<Schedule>();
        public ICollection<TaskItem>? Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
    }
}
