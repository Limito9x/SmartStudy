using System.Text.Json.Serialization;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using TaskStatus = System.Threading.Tasks.TaskStatus;

namespace SmartStudy.Server.Dtos;

public record ScheduleDto(
    int Id,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    string? Location
);

public record RequestScheduleDto(
    int RoutineId,
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    string? Location
);

public record UpdateScheduleDto(
    DayOfWeek DayOfWeek,
    TimeOnly StartTime,
    int Duration,
    string? Location
);

public record ResponseScheduleDto(
    int Id,
    int RoutineId,
    DayOfWeek DayOfWeek,
    TimeOnly? StartTime,
    int? Duration,
    string? Location
);

