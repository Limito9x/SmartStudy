using System.Net.Http.Json;

namespace SmartStudy.Server.Services;

// 1. Định nghĩa Data Transfer Objects (DTO) khớp với Python
public record ParseRequest(string file_url, int asset_id);
public record ParsedPage(int page_number, string markdown);
public record ParseResponse(int asset_id, List<ParsedPage> pages, int total_pages);

public interface ILlamaParseService
{
    Task<List<ParsedPage>> ParseFromUrlAsync(string fileUrl, int assetId);
}

public class LlamaParseService : ILlamaParseService
{
    private readonly HttpClient _httpClient;

    public LlamaParseService(HttpClient httpClient)
    {
        // trỏ tới "http://smartstudy_ai:8000"
        _httpClient = httpClient;
    }

    public async Task<List<ParsedPage>> ParseFromUrlAsync(string fileUrl, int assetId)
    {
        // Đóng gói dữ liệu
        var requestBody = new ParseRequest(fileUrl, assetId);

        // 1 phát POST duy nhất sang AI Service
        var response = await _httpClient.PostAsJsonAsync("/parse", requestBody);
        
        // Ném lỗi ngay nếu Python trả về lỗi HTTP
        response.EnsureSuccessStatusCode();

        // Đọc kết quả gọn gàng bằng JSON
        var result = await response.Content.ReadFromJsonAsync<ParseResponse>();
    
        if (result == null || result.pages == null || !result.pages.Any())
        {
            throw new Exception("AI Service trả về dữ liệu rỗng!");
        }

        // Trả về danh sách từng trang cho IDocumentChunkService xử lý
        return result.pages;
    }
}