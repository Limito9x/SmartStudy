namespace SmartStudy.Server.Dtos
{
    public record ChatDto
    (
        string prompt,
        List<int>? selectedAssetIds = null
    );

    public record ChatHistoryDto
    (
        int Id,
        string Role,
        string Content,
        string? Data,
        string Type
    );

    public record SessionDto
    (
        string Title,
        int? CourseId
    );

    public record SessionResponseDto(
        int Id,
        string Title,
        int? CourseId
    );
}
