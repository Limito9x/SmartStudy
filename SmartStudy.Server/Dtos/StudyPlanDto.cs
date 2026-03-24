using System.Text.Json.Serialization;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public class AcademicContextDto
    {
        public List<AcademicTerm> Terms { get; set; } = new List<AcademicTerm>();
        public List<AcademicYear> Years { get; set; } = new List<AcademicYear>();
    }
    public record RequestStudyPlanDto
    (
        string Name,
        DateTime StartDate,
        DateTime EndDate,
        StudyPlanType Type,
        int? TermId,
        int? YearId
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
        StudyPlanStatus Status,
        StudyPlanType Type,
        int? TermId,
        int? YearId
    );

    public record SimpleResponseStudyPlanDto
    (
        int Id,
        string Name,
        DateTime StartDate,
        DateTime EndDate,
        StudyPlanStatus Status,
        StudyPlanType Type,
        int? TermId,
        int? YearId
    );

    public record SuggestStudyPlanDto
    (
        string Prompt
    );

    public record UpdateStudyPlanStatusDto(StudyPlanStatus Status);
}

