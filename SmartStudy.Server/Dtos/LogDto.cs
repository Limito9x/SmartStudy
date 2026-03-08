using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record LogDto
    (
        int Id,
        string? Note,
        int? ActualDurationMinutes, // Số phút dành ra
        int? ProductivityScore,
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        int? EventRequirementId,
        float? EarnedValue
    );

    // Task generate log
    public record LogWorkDto
    (
        string? Note,
        int? ActualDurationMinutes, // Số phút dành ra
        int? ProductivityScore,
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        int? EventRequirementId,
        float? EarnedValue,
        List<int>? AssetIds,
        bool markAsCompleted
    );
}
