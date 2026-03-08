using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    // Tạo task
    public record RequestTaskDto
    (
        string Name,
        string? Description,
        DateTime? DueDate,
        DateTime? StartAt,
        DateTime? EndAt,
        TaskType Type,
        List<int>? LinkedFormIds,
        int? CourseId
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
        DateTime? DueDate,
        DateTime? CompletedAt,
        DateTime? StartAt,
        DateTime? EndAt,
        TaskType Type,
        Entities.Enums.TaskStatus Status,
        List<LogDto>? Logs,
        int? RoutineId,
        int? ScheduleId,
        int CourseId
    );

    public record SimpleResponseTaskDto
    (
        int Id,
        string Name,
        string? Description,
        DateTime? DueDate,
        DateTime? CompletedAt,
        Entities.Enums.TaskStatus Status,
        int? RoutineId,
        int? ScheduleId,
        int CourseId
    );
}
