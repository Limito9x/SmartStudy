using System.Text.Json;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities;

public class TemplatePayload
{
    public int DurationDays { get; set; }
    public List<TemplateCourse> Courses { get; set; } = [];
}

public class TemplateSubject
{
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public int? Credits { get; set; }
}

public class TemplateCourse
{
    public string Name { get; set; } = null!;
    public string? Goal { get; set; }
    public double? TargetScore { get; set; }
    public TemplateSubject? Subject { get; set; }
    public List<TemplateRoutine> Routines { get; set; } = [];
}

public class TemplateRoutine
{
    public string Name { get; set; } = null!;
    public TaskType Type { get; set; }
    public int StartDayOffset { get; set; }
    public int? EndDayOffset { get; set; }
    public List<TemplateSchedule> Schedules { get; set; } = [];
}

public class TemplateSchedule
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly? StartTime { get; set; }
    public int? Duration { get; set; }
}

public class PlanTemplate : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int? CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public TemplatePayload Payload { get; set; } = null!;
    public StudyPlanType Type { get; set; } = StudyPlanType.Academic;
    public int? SourcePlanId { get; set; }
    public StudyPlan ? SourcePlan { get; set; }
}