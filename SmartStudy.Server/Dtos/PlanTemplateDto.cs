using SmartStudy.Server.Entities;

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

// Clone template thành plan thật
public record CloneTemplateDto(
    int TemplateId,
    string? Name,           // override tên nếu muốn
    DateTime StartDate
);

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
    public int? DurationDays { get; set; }       // kéo dài bao lâu
}

// Detail view — có payload đầy đủ để preview
public class PlanTemplateDetailDto : PlanTemplateDto
{
    public TemplatePayload Payload { get; set; } = null!;
}