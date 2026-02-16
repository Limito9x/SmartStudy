using System.ComponentModel;

namespace SmartStudy.Server.Dtos
{
    public class AiResponseChunk
    {
        public string Type { get; set; } // "Text" hoặc "UI"
        public string? Content { get; set; } // Lời nói của AI
        public object? Data { get; set; }    // Dữ liệu UI (nếu có)
    }
    public class SemesterUIData
    {
        [Description("Brief title of the Semester")]
        public string Title { get; set; }
        [Description("Detailed description of the Semester")]
        public string? Description { get; set; }
        //[Description("Semesterned start date of the Semester")]
        //public DateTime? StartDate { get; set; } = DateTime.UtcNow;
        [Description("List of Courses in the Semester")]
        public List<CourseUIData> Courses { get; set; }
    }

    public class CourseUIData
    {
        [Description("Title of the Course")]
        public string Title { get; set; }
        [Description("Description of the Course")]
        public string? Description { get; set; }
        [Description("Duration days of the Semester")]
        public int DurationDays { get; set; }
        //[Description("List of tasks in the Course")]
        //public List<TaskUIData> Tasks { get; set; }
    }

    public class TaskUIData
    {
        [Description("Name of the task")]
        public string Name { get; set; }
        [Description("Description of the task")]
        public string? Description { get; set; }
        [Description("Days offset from start date of Course")]
        public int DaysOffset { get; set; }
    }

    public class ConvertedSemesterData
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<ConvertedCourseData> Courses { get; set; }
    }

    public class ConvertedCourseData
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
