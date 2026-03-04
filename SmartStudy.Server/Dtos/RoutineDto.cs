using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

public record RequestRoutineDto(
    string Name,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    int? GoalId,
    int? GradeId
    //List<ScheduleDto>? Schedules
);

public record ResponseRoutineDto(
    int Id,
    string Name,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    List<ScheduleResponseDto>? Schedules,
    int? GoalId,
    int? GradeId,
    List<ResponseTaskDto>? Tasks
);

public record SimpleResponseRoutineDto(
    int Id,
    string Name,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    List<ScheduleResponseDto>? Schedules,
    int? GoalId,
    int? GradeId
);