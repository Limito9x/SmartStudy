using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestSemesterDto
    (
        string Name,
        TermType Term,
        int Year,
        DateTime? StartDate,
        DateTime? EndDate,
        float? TargetGPA
    );

    public record ResponseSemesterDto
    (
        int Id,
        string Title,
        string? Description,
        decimal? Progress,
        DateTime? StartDate,
        DateTime? EndDate,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        List <SimpleResponseCourseDto>? Courses
    );

    public record SimpleResponseSemesterDto
    (
        int Id,
        string Title,
        decimal? Progress,
        DateTime? StartDate,
        DateTime? EndDate
    );

    public record SuggestSemesterDto
    (
        string Prompt
    );
}
