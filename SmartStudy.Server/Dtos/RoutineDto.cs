using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestRoutineDto(
        string Name,
        string? Instructor,
        string? Description,
        TaskType Type,
        int? PhaseId,
        DateTime? StartDate,
        DateTime? EndDate,
        int? StudyPlanId,
        List<ScheduleDto>? Schedules
    );
    
    public record SyncRoutineDto(
        int Id,
        string Name,
        string? Instructor,
        string? Description,
        DateTime StartDate,
        DateTime? EndDate,
        TaskType Type,
        int? PhaseId,
        int? StudyPlanId,
        List<ScheduleDto>? Schedules
    );

    public record ResponseRoutineDto(
        int Id,
        string Name,
        string? Instructor,
        string? Description,
        TaskType Type,
        DateTime StartDate,
        DateTime? EndDate,
        int? PhaseId,
        bool IsActive,
        int? StudyPlanId,
        List<ScheduleDto> Schedules,
        List<ResponseTaskDto>? Tasks
    );

    public record SimpleResponseRoutineDto(
        int Id,
        string Name,
        string? Instructor,
        string? Description,
        DateTime StartDate,
        DateTime? EndDate,
        TaskType Type,
        bool IsActive,
        int? PhaseId,
        List<ScheduleDto> Schedules
    );
}
