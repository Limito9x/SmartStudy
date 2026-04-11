public class ChatMessageDto
{
    public string Role { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class ChatRequestDto
{
    public string Query { get; set; } = null!;
    public List<ChatMessageDto> History { get; set; } = new List<ChatMessageDto>();
    public int UserId { get; set; }
    public string SystemPrompt { get; set; } = null!;
    public int? CourseId { get; set; }
}

public interface IAiApiClient
{
    Task EmbeddingGraph(string label, List<int> pg_ids);
    Task IngestAssetAsync(int assetId, string fileUrl);
    Task DeleteIngestedAssetsAsync(List<string> AssetIds);
    Task<Stream> StreamingChatAsync(ChatRequestDto request, CancellationToken cancellationToken = default);
}