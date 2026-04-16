using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    // Tạo task
    public record RequestTaskDto
    (
        string Name,
        string? Description,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        TaskType Type,
        int? PhaseId,
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
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        TaskType Type,
        string? Location,
        Entities.Enums.TaskStatus Status,
        bool IsOverdue,
        List<LogDto>? Logs,
        int? RoutineId,
        int? ScheduleId,
        int? PhaseId,
        int? StudyPlanId
    );

    public record SimpleResponseTaskDto
    (
        int Id,
        string Name,
        string? Description,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        TaskType Type,
        Entities.Enums.TaskStatus Status,
        bool IsOverdue,
        int? RoutineId,
        int? ScheduleId,
        int? PhaseId,
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
