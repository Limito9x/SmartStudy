using System.Text.Json.Serialization;

namespace SmartStudy.Server.Dtos
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StudyPlanStatus
    {
        Planning,
        Active,
        Completed
    }

    public record RequestStudyPlanDto
    (
        int AcademicTermId,
        int AcademicYearId,
        DateTime StartDate,
        DateTime EndDate
    );

    public record BulkCreateStudyPlanDto
    (
        List<RequestStudyPlanDto> StudyPlans // Frontend tự động tính và đc xác thực bởi người dùng)
    );

    public record CommitStudyPlanDto
    (
        List<int> EnrollingCourseIds
    );

    public record ResponseStudyPlanDto
    (
        int Id,
        int AcademicTermId,
        int AcademicYearId,
        string DisplayName,
        DateTime StartDate,
        DateTime EndDate,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        StudyPlanStatus Status
    );

    public record SimpleResponseStudyPlanDto
    (
        int Id,
        string DisplayName,
        DateTime StartDate,
        DateTime EndDate,
        StudyPlanStatus Status
    );

    public record SuggestStudyPlanDto
    (
        string Prompt
    );

    public record UpdateStudyPlanStatusDto(StudyPlanStatus Status);
}

