namespace SmartStudy.Server.Services;

public class GarbageCollectorJob: BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<GarbageCollectorJob> _logger;
    
    public GarbageCollectorJob(IServiceProvider serviceProvider, ILogger<GarbageCollectorJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Garbage Collector Job is starting.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var assetService = scope.ServiceProvider.GetRequiredService<IAssetService>();
                    var count = await assetService.CleanupSoftDeletedAssetsAsync(stoppingToken);

                    if (count > 0)
                    {
                        _logger.LogInformation("[Garbage Collector] Deleted {Count} soft-deleted assets.", count);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Garbage Collector] Error occured during job execution.!");
            }
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}