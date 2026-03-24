using Microsoft.AspNetCore.Identity;

namespace SmartStudy.Server.Entities
{
    public class User: IdentityUser<int>
    {
        public required string FullName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
        public ICollection<StudyPlan>? StudyPlans { get; set; }
        public ICollection<TaskItem>? Tasks { get; set; }
        public ICollection<Routine>? Routines { get; set; }
        public ICollection<Subject>? Subjects { get; set; }
        public virtual StudentInfo StudentInfo { get; set; }
    }
}
