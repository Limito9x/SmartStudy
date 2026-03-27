using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;

namespace SmartStudy.Server.Services;

public class RagProcessingWorker: BackgroundService
{
    private readonly AssetQueueService _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RagProcessingWorker> _logger;
    
    public RagProcessingWorker(AssetQueueService queue, IServiceScopeFactory scopeFactory, ILogger<RagProcessingWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🛠️ Thợ RAG đã thức dậy và đứng canh băng chuyền...");
        
        await foreach(var assetId in _queue.ReadAllAsync(stoppingToken))
        {
            _logger.LogInformation("[Worker]🚀 Nhận được asset {AssetId} từ băng chuyền, bắt đầu xử lý...", assetId);
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var llamaService = scope.ServiceProvider.GetRequiredService<ILlamaParseService>();
                var chunkService = scope.ServiceProvider.GetRequiredService<IDocumentChunkService>();
                
                var asset = await context.Assets.FindAsync(assetId);
                if (asset == null) continue;
                
                var parsedPages = await llamaService.ParseFromUrlAsync(asset.Url);
                await chunkService.SaveChunksToDatabaseAsync(assetId, parsedPages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi xử lý asset {AssetId}", assetId);
            }
        }
    }
}