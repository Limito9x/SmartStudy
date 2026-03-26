using System.Text;
using System.Text.Json;

namespace SmartStudy.Server.Services.AI;

// Khai báo cấu trúc siêu gọn nhẹ, không cần get/set dài dòng
public record GeminiEmbeddingRequest(GeminiContent content, int outputDimensionality);
public record GeminiContent(GeminiPart[] parts);
public record GeminiPart(string text);

public class GeminiEmbeddingService: IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string model = "gemini-embedding-001";
    private readonly string baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    
    public GeminiEmbeddingService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey");
        _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _apiKey);
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        if(string.IsNullOrWhiteSpace(text))
            return Array.Empty<float>();
        
        var url = $"{baseUrl}/{model}:embedContent";

        var requestBody = new GeminiEmbeddingRequest(
            content: new GeminiContent(
                parts: new []
                {
                    new GeminiPart(text:text)
                }),
            outputDimensionality: 768
        );

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json");
        
        var response = await _httpClient.PostAsync(url, jsonContent);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {response.StatusCode}, Details: {error}");
        }

        var responseString = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseString);
        
        var embeddingArray = doc.RootElement
            .GetProperty("embedding")
            .GetProperty("values")
            .EnumerateArray()
            .Select(x => x.GetSingle())
            .ToArray();

        return embeddingArray;
    }
}