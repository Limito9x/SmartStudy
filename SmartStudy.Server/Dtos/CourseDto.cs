using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        string Name,
        int StudyPlanId,
        double? TargetScore,
        double? FinalScore,
        string? Goal
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
        public double Progress { get; set; }
        public List<ResponseTimelineEventDto>? TimelineEvents { get; set; }
    }

    public record SyncDraftCoursesDto(List<int> SelectedCourseIds);

    public record UpdateCourseStatusDto(CourseStatus Status);
}
