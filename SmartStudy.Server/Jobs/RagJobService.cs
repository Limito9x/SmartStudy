using Hangfire;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Jobs;

public interface IRagJobService
{
    Task ProcessAssetRagAsync(int assetId);
}

public class RagJobService: IRagJobService
{
    private readonly ApplicationDbContext _context;
    private readonly IAiApiClient _aiApiClient;
    private readonly ILogger<RagJobService> _logger;
    
    public RagJobService(
        ApplicationDbContext context, 
        IAiApiClient llamaService,
        ILogger<RagJobService> logger)
    {
        _context = context;
        _aiApiClient = llamaService;
        _logger = logger;
    }

    
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    public async Task ProcessAssetRagAsync(int assetId)
    {
        _logger.LogInformation("🚀 [Hangfire Job] Bắt đầu xử lý RAG cho Asset ID: {AssetId}", assetId);
        
        var asset = await _context.Assets.FindAsync(assetId);
        if (asset == null)
        {
            _logger.LogWarning("❌ Không tìm thấy Asset {AssetId} trong Database.", assetId);
            return;
        }

        try
        {
            // 1. Cập nhật trạng thái (Nếu bạn có thêm cột Status như đã bàn)
            asset.Status = AssetStatus.Processing;
            await _context.SaveChangesAsync();

            // 2. Giao việc cho Python Service (Chỉ 1 dòng code, đợi Python lo hết)
            _logger.LogInformation("⏳ Đang nhờ AI Service ingest asset...");
            await _aiApiClient.IngestAssetAsync(assetId, asset.Url);

            // 4. Hoàn thành
            asset.Status = AssetStatus.Analyzed;
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("✅ [Hangfire Job] Đã hoàn tất RAG cho Asset {AssetId}", assetId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "🔥 Lỗi khi xử lý Asset {AssetId}", assetId);
            asset.Status = AssetStatus.Failed;
            await _context.SaveChangesAsync();
            
            // Quăng lỗi ra để Hangfire biết mà ghi log lên Dashboard và chạy Retry
            throw; 
        }
    }
}