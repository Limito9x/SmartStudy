using SmartStudy.Server.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace SmartStudy.Server.Entities
{
    public class Subject : BaseSimpleEntity
    {
        [Required]
        public required string Code { get; set; }
        public required string Name { get; set; }
        public int Credits { get; set; }
        public SubjectType Type { get; set; }
        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}

