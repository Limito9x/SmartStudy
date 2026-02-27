using SmartStudy.Server.Entities.Enums;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Dtos
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SemesterStatus
    {
        Past,
        Active,
        Future
    }
    // Semester dto trở thành thứ đc tạo ra tự động, không còn do người dùng nhập thủ công
    public record RequestSemesterDto
    (
        TermType Term,
        int Year,
        DateTime StartDate,
        DateTime EndDate
    );

    public record ResponseSemesterDto
    (
        int Id,
        string Name,
        string? Description,
        decimal? Progress,
        DateTime StartDate,
        DateTime EndDate,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        SemesterStatus Status,
        List <SimpleResponseCourseDto>? Courses
    );

    public record SimpleResponseSemesterDto
    (
        int Id,
        string Name,
        decimal? Progress,
        DateTime StartDate,
        DateTime EndDate,
        SemesterStatus Status
    );

    public record SuggestSemesterDto
    (
        string Prompt
    );
}
