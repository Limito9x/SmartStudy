using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestLogDto
    (
        string? Note,
        int? ActualDurationMinutes, // Số phút dành ra
        int? ProductivityScore,
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        string[]? Artifacts, // Để tạm lưu các file liên quan đến log này
        int? EventRequirementId,
        float? EarnedValue,
        int TaskId
    );

    public record ResponseLogDto
    (
        int Id,
        string? Note,
        int? ActualDurationMinutes,
        int? ProductivityScore,
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        DateTime? TimerStartAt,
        DateTime? TimerEndAt,
        string[]? Artifacts,
        float? EarnedValue
    );
}
