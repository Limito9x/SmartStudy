using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        string Name,
        int StudyPlanId,
        double? TargetScore,
        double? FinalScore,
        string? Goal,
        string? Color,
        int? SubjectId
    );

    public class ResponseCourseDto
    {
        public int Id { get; set; }
        public int StudyPlanId { get; set; }
        public string Name { get; set; } = null!;
        public double? TargetScore { get; set; }
        public double? FinalScore { get; set; }
        public string? Goal { get; set; }
        public CourseStatus Status { get; set; }
        public string? Color { get; set; }
        public double Progress { get; set; }
        public int? SubjectId { get; set; }
        public List<ResponseTimelineEventDto>? TimelineEvents { get; set; }
    }

    public record UpdateCourseStatusDto(CourseStatus Status);
    
    public class CourseRoutineDto
    {
        public SimpleResponseRoutineDto Routine { get; set; }
        public List<ResponseTaskDto> Tasks { get; set; }
    }

    public class CourseWorkloadDto
    {
        public List<CourseRoutineDto> Routines { get; set; }
        public List<ResponseTaskDto> SingleTasks { get; set; }
    }

    public class EventRoutineDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TaskType Type { get; set; }
        public int TotalCompletion { get; set; }
        public int TotalOccurrences { get; set; }
    }
    
    public class EventTaskDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TaskType Type { get; set; }
        public Entities.Enums.TaskStatus Status { get; set; }
    }

    public class CourseEventDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime? DueDate { get; set; }
        public EventType EventType { get; set; }
        public PriorityLevel Priority { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public int CompletedTasks { get; set; }
        public int TotalTasks { get; set; }
        public List<EventTaskDto> Tasks { get; set; } = new List<EventTaskDto>();
        public List<EventRoutineDto> Routines{ get; set; } = new List<EventRoutineDto>();
    }
}
