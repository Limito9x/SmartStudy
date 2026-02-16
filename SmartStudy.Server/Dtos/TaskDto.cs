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

    // Duyệt / Hoàn thành task
    public record ExecuteTaskDto
    (
        string? Note,
        RequestLogDto logDto,
        Entities.Enums.TaskStatus NewStatus
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
        ResponseLogDto? Log,
        int? RoutineId,
        int? GoalId,
        int? GradeId
    );

    public record SimpleResponseTaskDto
    (
        int Id,
        string Name,
        string? Description,
        DateTime? DueDate,
        DateTime? CompletedAt,
        Entities.Enums.TaskStatus Status,
        int? GoalId,
        int? GradeId
    );
}
