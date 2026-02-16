using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
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
