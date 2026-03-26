using System.Net.Http.Headers;
using System.Text.Json;

namespace SmartStudy.Server.Services;

public interface ILlamaParseService
{
    Task<string> ParseDocumentToMarkdownAsync(Stream fileStream, string fileName);
}

public class LlamaParseService: ILlamaParseService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    
    public LlamaParseService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["LlamaParse:ApiKey"] ?? throw new ArgumentNullException("LlamaParseApiKey is not configured.");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> ParseDocumentToMarkdownAsync(Stream fileStream, string fileName)
    {
        // Upload file lên Llama -> Lấy JobId và đợi
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(fileStream);
        content.Add(fileContent, "file", fileName);
        
        var uploadResponse = await _httpClient.PostAsync("https://api.cloud.llamaindex.ai/api/parsing/upload", content);
        uploadResponse.EnsureSuccessStatusCode();

        var uploadResultStr = await uploadResponse.Content.ReadAsStringAsync();
        var uploadDoc = JsonDocument.Parse(uploadResultStr);
        var jobId = uploadDoc.RootElement.GetProperty("id").GetString();
        
        if (string.IsNullOrEmpty(jobId))
            throw new Exception("LlamaParse không trả về Job ID!");
        
        Console.WriteLine($"[LlamaParse] Đã upload thành công. Job ID: {jobId}. Đang chờ AI đọc...");
        
        // Vòng lặp hỏi thăm kết quả (Polling)
        string status = "PENDING";
        while (status!="SUCCESS")
        {
            await Task.Delay(3000); // Đợi 3 giây rồi hỏi lại
            
            var statusResponse = await _httpClient.GetAsync($"https://api.cloud.llamaindex.ai/api/parsing/job/{jobId}");
            statusResponse.EnsureSuccessStatusCode();
            
            var statusResultStr = await statusResponse.Content.ReadAsStringAsync();
            var statusDoc = JsonDocument.Parse(statusResultStr);
            status = statusDoc.RootElement.GetProperty("status").GetString();

            if (status == "ERROR")
                throw new Exception("LlamaParse báo lỗi trong lúc đọc file!");
        }
        
        // Sau khi Llama xử lý xong -> Lấy text markdown trả về
        var markdownResponse = await _httpClient.GetAsync($"https://api.cloud.llamaindex.ai/api/parsing/job/{jobId}/result/markdown");
        markdownResponse.EnsureSuccessStatusCode();

        var markdownResultStr = await markdownResponse.Content.ReadAsStringAsync();
        var markdownDoc = JsonDocument.Parse(markdownResultStr);
        var finalMarkdown = markdownDoc.RootElement.GetProperty("markdown").GetString();

        return finalMarkdown;
    }
}