using SmartStudy.Server.Constants;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos;

public record CreatePlanTemplateDto(
    int SourcePlanId,
    string? Name,           // nếu null thì dùng tên plan gốc
    string? Description,
    bool IsPublic = false
);

// Update metadata — không update payload
public record UpdatePlanTemplateDto(
    string Name,
    string? Description,
    bool IsPublic
);

public class TemplateQueryParams : PaginationParams
{
    public StudyPlanType? Type { get; set; }
}

// Clone template thành plan thật
public record CloneTemplateDto(
    int TemplateId,
    string? Name,           // override tên nếu muốn
    DateTime StartDate
);

public record ImportSelectedCoursesDto(
    int TemplateId,
    int TargetPlanId,
    List<string> CourseRefs
);

public class ImportSelectedCoursesResultDto
{
    public int TargetPlanId { get; set; }
    public List<int> CreatedCourseIds { get; set; } = [];
    public List<int> CreatedPhaseIds { get; set; } = [];
    public List<int> CreatedRoutineIds { get; set; } = [];
    public List<int> CreatedTaskIds { get; set; } = [];
    public List<string> SkippedCourses { get; set; } = [];
}

// List view — gọn, không cần payload
public class PlanTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }  // tên admin/user tạo
    public int? SourcePlanId { get; set; }
    
    // Summary từ Payload — không trả cả cục JSON
    public int CourseCount { get; set; }        // có bao nhiêu môn
    public int RoutineCount { get; set; }        // có bao nhiêu routine
    public int PhaseCount { get; set; }          // có bao nhiêu giai đoạn
    public int MilestoneCount { get; set; }      // có bao nhiêu cột mốc
    public int CloneCount { get; set; }          // số plan đã clone từ template
    public int? DurationDays { get; set; }       // kéo dài bao lâu
    public StudyPlanType Type { get; set; }
    public List<string> Tags { get; set; } = [];
    public List<string> CoursePreviewNames { get; set; } = [];
    public List<string> PhasePreviewNames { get; set; } = [];
    public string? UniversityTag { get; set; }
    public string? MajorTag { get; set; }
    public string? ContextTag { get; set; }
}

public enum TemplateDetailItemType
{
    Routine = 0,
    Milestone = 1,
}

public class PlanTemplateDetailItemDto
{
    public TemplateDetailItemType ItemType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int StartDayOffset { get; set; }
    public int DurationDays { get; set; }
    public int? TotalSessions { get; set; }
}

public class PlanTemplateDetailPhaseDto
{
    public string Ref { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public PhaseType Type { get; set; } = PhaseType.General;
    public int StartDayOffset { get; set; }
    public int? EndDayOffset { get; set; }
    public int DurationDays { get; set; }
    public List<PlanTemplateDetailItemDto> Items { get; set; } = [];
}

public class PlanTemplateDetailCourseDto
{
    public string Ref { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? SubjectCode { get; set; }
    public string? Description { get; set; }
    public List<PlanTemplateDetailPhaseDto> Phases { get; set; } = [];
}

// Detail view — có payload đầy đủ để preview
public class PlanTemplateDetailDto : PlanTemplateDto
{
    public List<PlanTemplateDetailCourseDto> Courses { get; set; } = [];
}