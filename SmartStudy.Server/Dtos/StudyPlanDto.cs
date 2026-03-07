using System.Text.Json.Serialization;

namespace SmartStudy.Server.Dtos
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StudyPlanStatus
    {
        Past,
        Active,
        Future
    }

    public record RequestStudyPlanDto
    (
        int AcademicTermId,
        int AcademicYearId,
        DateTime StartDate,
        DateTime EndDate
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
}

