using SmartStudy.Server.Entities.Enums;

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