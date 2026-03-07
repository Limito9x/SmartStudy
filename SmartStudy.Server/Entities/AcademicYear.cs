using System.ComponentModel.DataAnnotations;

namespace SmartStudy.Server.Entities
{
    public class AcademicYear : BaseSimpleEntity
    {
        [Required]
        public int StartYear { get; set; }

        [Required]
        public int EndYear { get; set; }
    }
}

