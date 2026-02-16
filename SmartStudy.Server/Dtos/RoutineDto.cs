using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

public record ScheduleDto
(
    int Id,
    Frequency Frequency,
    int Interval,
    WeekDay[]? DaysOfWeek,
    int[]? DaysOfMonth,
    TimeOnly StartTime,
    int Duration,
    TimeUnit DurationUnit,
    string? Location
);

public record RequestRoutineDto(
    string Name,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    List<ScheduleDto>? Schedules,
    int? GoalId,
    int? GradeId
);

public record ResponseRoutineDto(
    int Id,
    string Name,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    List<ScheduleDto>? Schedules,
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
    List<ScheduleDto>? Schedules,
    int? GoalId,
    int? GradeId
);