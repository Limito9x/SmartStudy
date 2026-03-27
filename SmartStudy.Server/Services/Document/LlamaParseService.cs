using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SmartStudy.Server.Services;

public record ParsedPage
(int PageNumber,
    string Markdown);

public interface ILlamaParseService
{
    // Dành cho DevController test file local
    Task<List<ParsedPage>> ParseDocumentToMarkdownAsync(Stream fileStream, string fileName);
    
    // Dành cho Background Worker chạy Production
    Task<List<ParsedPage>> ParseFromUrlAsync(string fileUrl);
}

public class LlamaParseService : ILlamaParseService
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

    // ==========================================
    // 1. HÀM CHO DEV/TEST (UPLOAD STREAM)
    // ==========================================
    public async Task<List<ParsedPage>> ParseDocumentToMarkdownAsync(Stream fileStream, string fileName)
    {
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(fileStream);
        content.Add(fileContent, "file", fileName);
        
        var configJson = JsonSerializer.Serialize(new { tier = "cost_effective", version = "latest" });
        content.Add(new StringContent(configJson), "configuration");

        var uploadResponse = await _httpClient.PostAsync("https://api.cloud.llamaindex.ai/api/v2/parse/upload", content);
        uploadResponse.EnsureSuccessStatusCode();

        var uploadResultStr = await uploadResponse.Content.ReadAsStringAsync();
        using var uploadDoc = JsonDocument.Parse(uploadResultStr);
        var jobId = uploadDoc.RootElement.GetProperty("id").GetString();

        if (string.IsNullOrEmpty(jobId)) throw new Exception("LlamaParse không trả về Job ID!");
        Console.WriteLine($"[LlamaParse-Stream] Đã upload thành công. Job ID: {jobId}");

        // Gọi hàm xài chung ở dưới
        return await WaitForJobAndGetMarkdownAsync(jobId);
    }

    // ==========================================
    // 2. HÀM CHO PRODUCTION (NHẬN URL)
    // ==========================================
    public async Task<List<ParsedPage>> ParseFromUrlAsync(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl)) throw new ArgumentException("URL không được để trống!");

        var requestBody = new { source_url = fileUrl, tier = "cost_effective", version = "latest" };
        var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var uploadResponse = await _httpClient.PostAsync("https://api.cloud.llamaindex.ai/api/v2/parse", jsonContent);
        uploadResponse.EnsureSuccessStatusCode();

        var uploadResultStr = await uploadResponse.Content.ReadAsStringAsync();
        using var uploadDoc = JsonDocument.Parse(uploadResultStr);
        var jobId = uploadDoc.RootElement.GetProperty("id").GetString();

        if (string.IsNullOrEmpty(jobId)) throw new Exception("LlamaParse không trả về Job ID!");
        Console.WriteLine($"[LlamaParse-URL] Đã quăng link thành công. Job ID: {jobId}");

        // Gọi hàm xài chung ở dưới
        return await WaitForJobAndGetMarkdownAsync(jobId);
    }

    // ==========================================
    // 3. HÀM XÀI CHUNG: VÒNG LẶP CHỜ KẾT QUẢ (V2 TỐI ƯU & BẮT LỖI)
    // ==========================================
    private async Task<List<ParsedPage>> WaitForJobAndGetMarkdownAsync(string jobId)
    {
        string status = "PENDING";

        // BƯỚC 1: Vòng lặp chỉ đi hỏi thăm trạng thái (Không dùng expand)
        while (status != "COMPLETED") 
        {
            await Task.Delay(3000); // Đợi 3 giây rồi hỏi lại

            // Bỏ ?expand=markdown đi để tránh lỗi 400 lúc file chưa xong
            var statusResponse = await _httpClient.GetAsync($"https://api.cloud.llamaindex.ai/api/v2/parse/{jobId}");
            
            // TỰ BẮT LỖI ĐỂ XEM NÓ CHỬI GÌ (Thay cho EnsureSuccessStatusCode)
            if (!statusResponse.IsSuccessStatusCode)
            {
                var errorMsg = await statusResponse.Content.ReadAsStringAsync();
                throw new Exception($"[Lỗi Polling] API v2 trả về {statusResponse.StatusCode}. Chi tiết: {errorMsg}");
            }

            var statusResultStr = await statusResponse.Content.ReadAsStringAsync();
            using var statusDoc = JsonDocument.Parse(statusResultStr);
        
            var jobElement = statusDoc.RootElement.GetProperty("job");
            status = jobElement.GetProperty("status").GetString() ?? "";

            Console.WriteLine($"[LlamaParse] Trạng thái hiện tại: {status}...");

            if (status == "FAILED" || status == "CANCELLED")
            {
                var errorMsg = jobElement.TryGetProperty("error_message", out var err) ? err.GetString() : "Unknown";
                throw new Exception($"LlamaParse v2 báo lỗi lúc xử lý! Trạng thái: {status}. Chi tiết: {errorMsg}");
            }
        }

        // BƯỚC 2: Khi đã COMPLETED, gửi 1 request chốt hạ có expand=markdown để kéo text về
        Console.WriteLine($"[LlamaParse] Đã đọc xong! Đang kéo text về...");
        var resultResponse = await _httpClient.GetAsync($"https://api.cloud.llamaindex.ai/api/v2/parse/{jobId}?expand=markdown");
        
        if (!resultResponse.IsSuccessStatusCode)
        {
            var errorMsg = await resultResponse.Content.ReadAsStringAsync();
            throw new Exception($"[Lỗi Kéo Text] API v2 trả về {resultResponse.StatusCode}. Chi tiết: {errorMsg}");
        }

        var resultStr = await resultResponse.Content.ReadAsStringAsync();
        using var resultDoc = JsonDocument.Parse(resultStr);

        // Markdown trả về sẽ nằm song song với object "job"
        if (resultDoc.RootElement.TryGetProperty("markdown", out var markdownElement))
        {
            // Trường hợp 1: Nếu nó là String thuần túy (giống v1)
            if (markdownElement.ValueKind == JsonValueKind.String)
            {
                var markdown = markdownElement.GetString() ?? "";
                return new List<ParsedPage>()
                {
                    new ParsedPage(PageNumber: 1, Markdown: markdown)
                };
            }
            // Trường hợp 2: Bị bọc thành Object (kiểu v2)
            else if (markdownElement.ValueKind == JsonValueKind.Object)
            {
                // Tìm cái mảng "pages"
                if (markdownElement.TryGetProperty("pages", out var pagesArray) && pagesArray.ValueKind == JsonValueKind.Array)
                {
                    var response = new List<ParsedPage>();
                    
                    // Lặp qua từng trang để gom Markdown
                    foreach (var page in pagesArray.EnumerateArray())
                    {
                        if(!page.GetProperty("success").GetBoolean()) continue;
                        var pageNumber = page.GetProperty("page_number").GetInt32();
                        var pageMarkdown = page.GetProperty("markdown").GetString() ?? "";
                        response.Add(new ParsedPage(PageNumber: pageNumber, Markdown: pageMarkdown));
                    }

                    return response;
                }
                
                return new List<ParsedPage>()
                {
                    new ParsedPage(PageNumber: 1, Markdown: markdownElement.GetRawText())
                };
            }
        }

        return new List<ParsedPage>()
        {
            new ParsedPage(PageNumber: 1, Markdown: "")
        };
    }
}