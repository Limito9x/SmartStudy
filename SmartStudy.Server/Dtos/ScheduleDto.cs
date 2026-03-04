using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Dtos
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ScheduleOwnerType
    {
        Course,
        Routine
    }
    public record ScheduleRequestDto
    (
        Frequency Frequency,
        int Interval,
        DayOfWeek DayOfWeek,
        HashSet<int>? DaysOfMonth,
        TimeOnly StartTime,
        int Duration,
        TimeUnit DurationUnit,
        string? Location,
        ScheduleOwnerType OwnerType,
        int OwnerId
    );
    public record ScheduleResponseDto
    (
        int Id,
        Frequency Frequency,
        int Interval,
        DayOfWeek DayOfWeek,
        HashSet<int>? DaysOfMonth,
        int StartHour,
        int StartMinute,
        int Duration,
        TimeUnit DurationUnit,
        string? Location,
        SimpleResponseCourseDto? Course,
        SimpleResponseRoutineDto? Routine
    );
    public record ScheduleQuery
    (
        ScheduleOwnerType OwnerType,
        int OwnerId
    );
    public record RoutineTodayDto(
        int Id,
        string Name,
        string? Description,
        string Type,
        TaskType? SubType,
        DateTime StartAt,
        DateTime? EndAt,
        DateTime? DueDate,
        List<int>? LinkedFormIds,
        SimpleResponseCourseDto? Course
    );
}
