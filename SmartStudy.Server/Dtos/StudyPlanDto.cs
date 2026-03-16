using System.Text.Json.Serialization;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestStudyPlanDto
    (
        string Name,
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
        string Name,
        DateTime StartDate,
        DateTime EndDate,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        StudyPlanStatus Status
    );

    public record SimpleResponseStudyPlanDto
    (
        int Id,
        string Name,
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

