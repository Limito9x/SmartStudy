using System.Text.Json;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities;

public class TemplatePayload
{
    public int PayloadVersion { get; set; } = 2;
    public int DurationDays { get; set; }
    public List<string> Tags { get; set; } = [];
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
    public string Ref { get; set; } = string.Empty;
    public string Name { get; set; } = null!;
    public string? Goal { get; set; }
    public double? TargetScore { get; set; }
    public TemplateSubject? Subject { get; set; }
    public List<TemplateCourseAsset> Assets { get; set; } = [];
    public List<TemplatePhase> Phases { get; set; } = [];

    // Legacy payload compatibility (v1).
    public List<TemplateRoutine> Routines { get; set; } = [];
}

public class TemplateCourseAsset
{
    public int AssetId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public FileType Type { get; set; } = FileType.Other;
    public long FileSize { get; set; }
}

public class TemplatePhase
{
    public string Ref { get; set; } = string.Empty;
    public string Title { get; set; } = null!;
    public PhaseType Type { get; set; } = PhaseType.General;
    public PriorityLevel Priority { get; set; } = PriorityLevel.Low;
    public int StartDayOffset { get; set; }
    public int? EndDayOffset { get; set; }
    public string? Notes { get; set; }
    public List<TemplateRoutine> Routines { get; set; } = [];
    public List<TemplateTask> Tasks { get; set; } = [];
}

public class TemplateRoutine
{
    public string Name { get; set; } = null!;
    public TaskType Type { get; set; }
    public int StartDayOffset { get; set; }
    public int? EndDayOffset { get; set; }
    public List<TemplateSchedule> Schedules { get; set; } = [];
}

public class TemplateTask
{
    public string Name { get; set; } = null!;
    public TaskType Type { get; set; } = TaskType.Milestone;
    public string? Description { get; set; }
    public int StartDayOffset { get; set; }
    public int? EndDayOffset { get; set; }
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