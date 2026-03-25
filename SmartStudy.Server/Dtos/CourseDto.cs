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

    public record SyncDraftCoursesDto(List<int> SelectedCourseIds);

    public record UpdateCourseStatusDto(CourseStatus Status);
    

    // 1 log thường kèm với các tài liệu
    public class LogDoc
    {
        public LogDto Log { get; set; }
        public List<AssetResponseDto>  Assets { get; set; }
    }

    public class CourseTaskDto
    {
        public ResponseTaskDto Task { get; set; }
        public List<AssetResponseDto> Docs { get; set; }
        public List<LogDoc> Logs { get; set; }
    }
    
    public class CourseRoutineDto
    {
        public SimpleResponseRoutineDto Routine { get; set; }
        public List<CourseTaskDto> Tasks { get; set; }
    }

    public class CourseWorkloadDto
    {
        public List<CourseRoutineDto> Routines { get; set; }
        public List<CourseTaskDto> SingleTasks { get; set; }
    }
}
