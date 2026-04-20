using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos;

public class InternalStudyPlanProgressDto
{
    public int StudyPlanId { get; set; }
    public string StudyPlanName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int ActiveCourseCount { get; set; }
    public int TotalExpectations { get; set; }
    public int TotalCompletions { get; set; }
    public double Progress { get; set; }
}

public class InternalCourseProgressDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public CourseStatus CourseStatus { get; set; }
    public int StudyPlanId { get; set; }
    public StudyPlanStatus StudyPlanStatus { get; set; }
    public int TotalExpectations { get; set; }
    public int TotalCompletions { get; set; }
    public double Progress { get; set; }
    public double TotalLoggedDuration { get; set; }
}

public class InternalLearningCalendarContextDto
{
    public int UserId { get; set; }
    public int? CourseId { get; set; }
    public int HorizonDays { get; set; }
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public List<CalendarEventDto> Events { get; set; } = [];
}

public class InternalPhasePreviewRequestDto
{
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public int HorizonDays { get; set; } = 14;
    public string? LearningGoal { get; set; }
}

public class InternalPhasePreviewDto
{
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public string Source { get; set; } = "calendar_progress_graph";
    public InternalPhasePreviewPhaseDto Phase { get; set; } = new();
    public List<InternalPhasePreviewTaskDto> SuggestedTasks { get; set; } = [];
    public List<InternalPhasePreviewWindowDto> SuggestedStudyWindows { get; set; } = [];
    public string ContextSummary { get; set; } = string.Empty;
}

public class InternalPhasePreviewPhaseDto
{
    public string Title { get; set; } = string.Empty;
    public PhaseType Type { get; set; } = PhaseType.ExamPrep;
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Notes { get; set; }
    public string Rationale { get; set; } = string.Empty;
}

public class InternalPhasePreviewTaskDto
{
    public string Name { get; set; } = string.Empty;
    public TaskType Type { get; set; } = TaskType.SelfStudy;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Description { get; set; }
}

public class InternalPhasePreviewWindowDto
{
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string Reason { get; set; } = string.Empty;
}