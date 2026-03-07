using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestTimelineEventDto
    (
        int CourseId,
        string Title,
        DateTime? DueDate, // Có thể tạo trước mà chưa biết ngày đến hạn
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
        DateTime DueDate,
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

