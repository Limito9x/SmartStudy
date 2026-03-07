using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        int StudyPlanId,
        int SubjectId,
        double? TargetScore,
        double? FinalScore
    );

    public record ResponseCourseDto
    (
        int Id,
        int StudyPlanId,
        int SubjectId,
        string SubjectName,
        int Credits,
        double? TargetScore,
        double? FinalScore
    );

    public record SimpleResponseCourseDto
    (
        int Id,
        int SubjectId,
        string SubjectName,
        int Credits,
        double? TargetScore,
        double? FinalScore
    );
}
