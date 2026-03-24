using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record ResponseSubjectDto
    (
        int Id,
        string? Code,
        string Name,
        int? Credits,
        StudyPlanType Type
    );

    public record RequestSubjectDto
    (
        string? Code,
        string Name,
        int? Credits,
        StudyPlanType Type
    );
}

