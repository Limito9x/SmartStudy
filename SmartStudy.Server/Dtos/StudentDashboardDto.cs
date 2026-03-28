using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos;

public class DashboardSummaryDto
{
    // 4 KPI cards
    public double WeeklyStudyHours { get; set; }
    public double WeeklyProductivity { get; set; }
    public double? HoursDelta { get; set; }
    public double? ProductivityDelta { get; set; }
    public double WeeklyCompletionRate { get; set; } // % tasks completed tuần này
    public int? DaysLeftInPlan { get; set; }
    public string? CurrentPlanName { get; set; }

    // Lists — đã nhóm sẵn ở backend
    public List<TodayTaskDto> OverdueTasks { get; set; } = [];
    public List<TodayTaskDto> TodayTasks { get; set; } = [];
    public List<TodayTaskDto> CompletedTasks { get; set; } = [];
    public List<UpcomingEventDto> UpcomingEvents { get; set; } = [];
}

public class TodayTaskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public TimeOnly? StartTime { get; set; }
    public int? PlannedDuration { get; set; }
    public TaskType Type { get; set; }
    public Entities.Enums.TaskStatus Status { get; set; }
    public string? CourseName { get; set; }   // hiện badge môn học
}

public class UpcomingEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public EventType Type { get; set; }
    public PriorityLevel Priority { get; set; }
    public string CourseName { get; set; } = null!;
    public int DaysUntil { get; set; }        // computed: DueDate - today
}