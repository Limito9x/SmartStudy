using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestPhaseDto
    (
        int CourseId,
        string Title,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        bool IsAllDay,
        PhaseType Type,
        PriorityLevel Priority,
        string? Location,
        string? Notes
    );

    public record ResponsePhaseDto
    (
        int Id,
        int CourseId,
        string Title,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        bool IsAllDay,
        PhaseType Type,
        PriorityLevel Priority,
        string? Location,
        string? Notes
    );

    public record EventRequirementReqDto
    (
        string Name,
        float ExpectedValue,
        string Unit,
        RequirementStrategy Strategy,
        int PhaseId
    );

    public record EventRequirementResDto
    (
        int Id,
        string Name,
        float ExpectedValue,
        string Unit,
        RequirementStrategy Strategy,
        int PhaseId
    );
}

