using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    // Tạo task
    public record RequestTaskDto
    (
        string Name,
        string? Description,
        DateOnly? TaskDate,
        TimeOnly? StartTime,
        int? PlannedDuration,
        TaskType Type,
        int? CourseId,
        int? TimelineEventId,
        int? StudyPlanId
    );

    public record TaskStatusDto
    (
        Entities.Enums.TaskStatus Status
    );

    public record ResponseTaskDto
    (
        int Id,
        string Name,
        string? Description,
        DateOnly? TaskDate,
        TimeOnly? StartTime,
        int? PlannedDuration,
        TaskType Type,
        string? Location,
        Entities.Enums.TaskStatus Status,
        List<LogDto>? Logs,
        int? RoutineId,
        int? ScheduleId,
        int? CourseId,
        int? TimelineEventId,
        int? StudyPlanId
    );

    public record SimpleResponseTaskDto
    (
        int Id,
        string Name,
        string? Description,
        DateOnly? TaskDate,
        TimeOnly? StartTime,
        int? PlannedDuration,
        TaskType Type,
        Entities.Enums.TaskStatus Status,
        int? RoutineId,
        int? ScheduleId,
        int? CourseId,
        int? TimelineEventId,
        int StudyPlanId
    );

    public class LogDoc
    {
        public LogDto Log { get; set; } = null!;
        public List<AssetResponseDto> Assets { get; set; } = [];
    }

    public class TaskDetailDto
    {
        public ResponseTaskDto Task { get; set; } = null!;
        public List<AssetResponseDto> Docs { get; set; } = [];
        public List<LogDoc> Logs { get; set; } = [];
    }
}
