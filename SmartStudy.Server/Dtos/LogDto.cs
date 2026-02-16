using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record RequestLogDto
    (
        string? Note,
        int? TimeSpent, // Số phút dành ra
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        float? GoalContributionValue,
        string[]? Artifats, // Để tạm lưu các file liên quan đến log này
        int? TaskId
    );

    public record ResponseLogDto
    (
        int Id,
        string? Note,
        int? TimeSpent, // Số phút dành ra
        ComrehensiveLevel? ComrehensiveLevel,
        DifficultyLevel? DifficultyLevel,
        float? GoalContributionValue,
        string[]? Artifats, // Để tạm lưu các file liên quan đến log này
        DateTime CompletedAt
    );
}
