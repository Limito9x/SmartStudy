using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos;

public record ScheduleDto(
    int Id,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    TimeUnit DurationUnit,
    string? Location
);

public record RequestScheduleDto(
    int RoutineId,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    TimeUnit DurationUnit,
    string? Location
);

public record UpdateScheduleDto(
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    TimeUnit DurationUnit,
    string? Location
);

public record ResponseScheduleDto(
    int Id,
    int RoutineId,
    DayOfWeek DayOfWeek,
    TimeOnly? StartTime,
    int? Duration,
    TimeUnit? DurationUnit,
    string? Location
);

public record CalendarTaskDto(
    int Id,
    string Title,
    DateOnly StartDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Location
);

