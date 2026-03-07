using System.ComponentModel.DataAnnotations;

namespace SmartStudy.Server.Entities
{
    public class AcademicTerm : BaseSimpleEntity
    {
        [Required]
        public required string Name { get; set; }

        [Required]
        public int TermValue { get; set; }
    }
}

