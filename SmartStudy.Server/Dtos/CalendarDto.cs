using System.Text.Json.Serialization;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos;

public class UnscheduledItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public CalendarEntityType EntityType { get; set; }
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
    public DateOnly Date { get; set; }
    public TimeOnly? StartTime { get; set; }
    public int? Duration { get; set; }
    public string? CourseName { get; set; }
    
    // Task specific
    public TaskType? TaskType { get; set; }
    public Entities.Enums.TaskStatus? Status { get; set; }
    
    // Event specific
    public PriorityLevel? Priority { get; set; }
    
    // Virtual = routine chưa được gen task thật
    public bool IsVirtual { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CalendarEntityType
{
    Task,
    Routine,
    TimelineEvent,
    Schedule
}