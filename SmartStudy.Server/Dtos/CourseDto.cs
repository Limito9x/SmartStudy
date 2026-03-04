using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos
{
    public record RequestCourseDto
    (
        string Name,
        int Credits,
        int SemesterId,
        List<ScheduleDto> ClassTimes
    );

    public record ResponseCourseDto
    (
        int Id,
        string Name,
        string? Description,
        int SemesterId,
        int Credits,
        float TargetGrade,
        double CurrentGPA,
        List<ResponseGradeDto> Grades
    );

    public record SimpleResponseCourseDto
    (
        int Id,
        string Name,
        int Credits,
        string? Description,
        float TargetGrade,
        double CurrentGPA
    );
}
