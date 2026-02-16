namespace SmartStudy.Server.Dtos
{
    public record ChatDto
    (
        string prompt
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
        int? SemesterId
    );

    public record SessionResponseDto(
        int Id,
        string Title,
        int? SemesterId
    );
}
