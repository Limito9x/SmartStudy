using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        string Name,
        int Credits,
        DateTime StartDate,
        DateTime EndDate,
        int SemesterId
    );

    public record ResponseCourseDto
    (
        int Id,
        string Title,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        int SemesterId,
        List<ResponseGradeDto> Grades
    );

    public record SimpleResponseCourseDto
    (
        int Id,
        string Title,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        SimpleResponseSemesterDto? Semester
    );
}
