using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestTimelineEventDto
    (
        int CourseId,
        string Title,
        DateTime StartDateTime,
        DateTime EndDateTime,
        bool IsAllDay,
        EventType Type,
        PriorityLevel Priority,
        string? Location,
        string? Notes
    );

    public record ResponseTimelineEventDto
    (
        int Id,
        int CourseId,
        string Title,
        DateTime StartDateTime,
        DateTime EndDateTime,
        bool IsAllDay,
        EventType Type,
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
        int TimelineEventId
    );

    public record EventRequirementResDto
    (
        int Id,
        string Name,
        float ExpectedValue,
        string Unit,
        RequirementStrategy Strategy,
        int TimelineEventId
    );
}

