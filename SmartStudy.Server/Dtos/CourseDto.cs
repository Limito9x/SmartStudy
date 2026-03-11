using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        int StudyPlanId,
        int SubjectId,
        double? TargetScore,
        double? FinalScore,
        string? Mentor,
        string? AlternativeName
    );

    public record ResponseCourseDto
    (
        int Id,
        int StudyPlanId,
        int SubjectId,
        string SubjectName,
        string? Mentor,
        string? AlternativeName,
        int Credits,
        double? TargetScore,
        double? FinalScore
    );

    public record SyncDraftCoursesDto(List<int> SelectedCourseIds);

    public record UpdateCourseStatusDto(CourseStatus Status);
}
