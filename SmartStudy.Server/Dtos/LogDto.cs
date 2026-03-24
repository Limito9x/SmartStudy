using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record LogDto
    (
        int Id,
        string? Note,
        int? ActualDuration, // Số phút dành ra
        ComprehensionLevel? ComprehensionLevel,
        DifficultyLevel? DifficultyLevel,
        double Productivity,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        DateTime? CompletedAt,
        SimpleResponseTaskDto Task
    );

    // Task generate log
    public record LogWorkDto
    (
        string? Note,
        int? ActualDuration, // Số phút dành ra
        ComprehensionLevel? ComprehensionLevel,
        DifficultyLevel? DifficultyLevel,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        List<int>? AssetIds,
        bool markAsCompleted
    );
}
