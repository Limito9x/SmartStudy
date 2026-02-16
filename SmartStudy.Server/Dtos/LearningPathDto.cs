using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos
{
    public record RequestLearningPathDto
    (
        string Name,
        string? Description,
        PathStatus? Status
    );

    public record ResponseLearningPathDto
    (
        int Id,
        string Name,
        string? Description,
        PathStatus? Status,
        List<ResponseGoalDto>? Goals
    );
}
