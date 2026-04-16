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
        public int TotalExpectations { get; set; }
        public int TotalCompletions { get; set; }
        public int? SubjectId { get; set; }
        public List<ResponsePhaseDto>? Phases { get; set; }
    }

    public class SimpleResponseCourseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public double? TargetScore { get; set; }
        public double? FinalScore { get; set; }
        public string? Goal { get; set; }
        public CourseStatus Status { get; set; }
        public string? Color { get; set; }
        public int? SubjectId { get; set; }
        public ResponseSubjectDto? Subject { get; set; }
    }

    public class CourseProgressDto
    {
        public double Progress { get; set; }
        public int TotalExpectations { get; set; }
        public int TotalCompletions { get; set; }
    }

    public record UpdateCourseStatusDto(CourseStatus Status);

    public class CourseOccurenceScheduleDto
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeOnly? StartTime { get; set; }
        public int? Duration { get; set; }
        public string? Location { get; set; }
    }
    
    public class CourseOccurenceDto
    {
        public int Number { get; set; }
        public DateTime Date { get; set; }
        public CourseOccurenceScheduleDto Schedule { get; set; } = null!;
        public int TaskId { get; set; }
        public string TaskName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public bool IsCompleted { get; set; }
    }

    public class CourseRoutineDto
    {
        public SimpleResponseRoutineDto Routine { get; set; } = null!;
        public List<CourseOccurenceDto> Occurences { get; set; } = [];
    }

    public class CourseWorkloadDto
    {
        public List<CoursePhaseWorkloadDto> Phases { get; set; } = [];
    }

    public class CoursePhaseWorkloadDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public PhaseType PhaseType { get; set; }
        public PriorityLevel Priority { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public double Progress { get; set; }
        public int TotalExpectations { get; set; }
        public int TotalCompletions { get; set; }
        public List<CourseRoutineDto> Routines { get; set; } = [];
        public List<ResponseTaskDto> Tasks { get; set; } = [];
    }
}
