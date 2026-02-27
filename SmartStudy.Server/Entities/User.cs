using Microsoft.AspNetCore.Identity;

namespace SmartStudy.Server.Entities
{
    public class User: IdentityUser<int>
    {
        public required string FullName { get; set; }
        public DateTime AdmissionDate { get; set; }
        public int SemestersPerYear { get; set; }
        public int WeeksPerSemester { get; set; }
        public int? WeeksOfSummerSemester { get; set; }
        public float ProgramLength { get; set; }
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
        public ICollection<Semester>? Semesters { get; set; }
        public ICollection<LearningPath>? LearningPaths { get; set; }
        public ICollection<Goal>? Goals { get; set; }
        public ICollection<TaskItem>? Tasks { get; set; }
        public ICollection<Routine>? Routines { get; set; }
    }
}
