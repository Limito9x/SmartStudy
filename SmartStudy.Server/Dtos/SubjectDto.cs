using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record ResponseSubjectDto
    (
        int Id,
        string Name,
        int Credits,
        SubjectType Type
    );

    public record RequestSubjectDto
    (
        string Name,
        int Credits,
        SubjectType Type
    );
}

