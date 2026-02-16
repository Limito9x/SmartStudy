using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestGoalDto
    (
        string Name,
        string? Unit,
        float TargetValue,
        float? CurrentValue,
        GoalType Type,
        int LearningPathId
    );

    public record ResponseGoalDto
    (
        int Id,
        string Name,
        string? Unit,
        float TargetValue,
        float? CurrentValue,
        GoalType Type,
        int LearningPathId,
        List<SimpleResponseTaskDto>? Tasks,
        List<SimpleResponseRoutineDto>? Routines
    );
}
