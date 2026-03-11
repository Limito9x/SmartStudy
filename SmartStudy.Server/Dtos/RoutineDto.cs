using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestRoutineDto(
        int Id,
        string Name,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        TaskType Type,
        int? CourseId,
        int? EventRequirementId,
        List<ScheduleDto>? Schedules
    );

    public record ResponseRoutineDto(
        int Id,
        string Name,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        int? CourseId,
        int? EventRequirementId,
        List<ScheduleDto> Schedules,
        List<ResponseTaskDto>? Tasks
    );

    public record SimpleResponseRoutineDto(
        int Id,
        string Name,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        int? CourseId,
        int? EventRequirementId,
        List<ScheduleDto> Schedules
    );
}
