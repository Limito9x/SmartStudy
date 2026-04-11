using System.Text.Json;

public class AiApiClient: IAiApiClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiApiClient> _logger;
    
    public AiApiClient(HttpClient httpClient,
     IConfiguration configuration,
     ILogger<AiApiClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task EmbeddingGraph(string label, List<int> pg_ids)
    {
        try
        {
            var payload = new { label, pg_ids };
            var options = new JsonSerializerOptions { 
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower 
            };
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/graph/embedding")
            {
                Content = JsonContent.Create(payload, options: options)
            };
            httpRequest.Headers.Add("X-Internal-Service-Key", _configuration["InternalServiceKey"]);
            
            var response = await _httpClient.SendAsync(httpRequest);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gọi API embedding graph");
        }
    }
    
    public async Task IngestAssetAsync(int assetId, string fileUrl)
    {

       var payload = new { asset_id = assetId, file_url = fileUrl };
    
    // Đừng bọc try-catch ở đây, hãy để lỗi mạng (nếu có) văng thẳng ra ngoài
    var response = await _httpClient.PostAsJsonAsync("/api/ingest", payload);
    
    if (!response.IsSuccessStatusCode)
    {
        // 1. Đọc chi tiết lỗi từ Python để ghi log .NET
        var errorContent = await response.Content.ReadAsStringAsync();
        _logger.LogError("Lỗi từ Python API: {ErrorContent}", errorContent);
        
        // 2. CHÍ MẠNG: Quăng Exception ra để báo cho Service biết
        throw new HttpRequestException($"Gọi Python API thất bại. Status: {response.StatusCode}. Chi tiết: {errorContent}");
    }
        
    }

    public async Task<Stream> StreamingChatAsync(ChatRequestDto request, CancellationToken cancellationToken = default)
    {
        var options = new JsonSerializerOptions { 
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower 
        };
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/chat")
        {
            Content = JsonContent.Create(request, options: options)
        };
        httpRequest.Headers.Add("X-Internal-Service-Key", _configuration["InternalServiceKey"]);
        
        var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsStreamAsync(cancellationToken);
    }

    public async Task DeleteIngestedAssetsAsync(List<string> assetIds)
    {
        var payload = new { asset_ids = assetIds };
        var options = new JsonSerializerOptions { 
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower 
        };
        var httpRequest = new HttpRequestMessage(HttpMethod.Delete, "/api/ingest")
        {
            Content = JsonContent.Create(payload, options: options)
        };
        
        var response = await _httpClient.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Lỗi khi xóa asset trên Python API: {ErrorContent}", errorContent);
            throw new HttpRequestException($"Xóa asset trên Python API thất bại. Status: {response.StatusCode}. Chi tiết: {errorContent}");
        }
    }
}