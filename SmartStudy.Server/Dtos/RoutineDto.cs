using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

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

public record ScheduleDto
(
    int Id,
    Frequency Frequency,
    int Interval,
    DayOfWeek DayOfWeek,
    HashSet<int>? DaysOfMonth,
    TimeOnly StartTime,
    int Duration,
    TimeUnit DurationUnit,
    string? Location
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