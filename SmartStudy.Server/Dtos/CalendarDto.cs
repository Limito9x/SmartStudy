using System.Text.Json.Serialization;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos;

public class UnscheduledItemDto
{
    public int Id { get; set; }
    public CalendarEntityType EntityType { get; set; }
    public string Name { get; set; }
    public string? Description  { get; set; } 
    public TaskType Type  { get; set; }
    public int? CourseId  { get; set; }
    public string? CourseName { get; set; }
    public string? CourseColor { get; set; }
    public int StudyPlanId  { get; set; }
    public int PlannedDuration { get; set; }
}

public class InboxResponseDto
{
    public List<UnscheduledItemDto> FloatingTasks { get; set; } = new();
    public List<UnscheduledItemDto> FixedRoutines { get; set; } = new();
}

public class CalendarEventDto
{
    // ID unique cho calendar library
    public string CalendarId { get; set; } = null!;
    
    // Để frontend biết click vào thì navigate đâu
    public int EntityId { get; set; }
    public int? RoutineId { get; set; }
    public CalendarEntityType EntityType { get; set; }
    
    public string Title { get; set; } = null!;
    public DateTime StartAt {get; set;}
    public DateTime EndAt {get; set;}
    public string? CourseName { get; set; }
    public int? CourseId { get; set; }
    
    // Task specific
    public TaskType? TaskType { get; set; }
    public string Status { get; set; } = "Pending";
    public bool IsOverdue { get; set; } = false;
    public string? Location {get; set;}
    
    // Virtual = routine chưa được gen task thật
    public bool IsVirtual { get; set; }
    public string? Color { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CalendarEntityType
{
    Task,
    Routine,
    TimelineEvent,
    Schedule
}

public record RescheduleTaskDto
(
    int TaskId,
    DateTime newStartDate,
    DateTime newEndDate
);