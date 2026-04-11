using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Integrations.Cloud;

namespace SmartStudy.Server.Jobs;

public interface IGarbageCollectorJob
{
    Task CleanupSoftDeleteAssets();
    Task CleanupOrphanedMedia();
}

public class GarbageCollectorJob: IGarbageCollectorJob
{
    private readonly ApplicationDbContext _context;
    private readonly ICloudClient _cloudinaryClient;
    private readonly ILogger<GarbageCollectorJob> _logger;
    private readonly IAiApiClient _aiApiClient;
    
    public GarbageCollectorJob(ILogger<GarbageCollectorJob> logger,
    ICloudClient cloudinaryClient,
    IAiApiClient aiApiClient,
    ApplicationDbContext context)
    {
        _context = context;
        _cloudinaryClient = cloudinaryClient;
        _logger = logger;
        _aiApiClient = aiApiClient;
    }

    public async Task CleanupSoftDeleteAssets()
    {
        // 1. Tìm rác đã "ôi thiu" qua 24h
        var cutoffTime = DateTime.UtcNow.AddDays(-1);

        var trashAssets = await _context.Assets
            .IgnoreQueryFilters() // Bỏ qua global filter
            .Include(a => a.AssetLinks.Where(al => al.DeletedAt == null)) // Chỉ lấy link còn sống
            .Where(a => 
                // ĐK 1: File bị xóa trực tiếp
                (a.DeletedAt != null && a.DeletedAt < cutoffTime) 
                ||
                // ĐK 2: File mồ côi (Sống qua 24h nhưng chả có cái link nào nhận nuôi)
                (a.DeletedAt == null && a.CreatedAt < cutoffTime && a.AssetLinks.Count == 0)
            )
            // Chỉ Select những cột cần thiết cho nhẹ RAM
            .Select(a => new { a.Id, a.PublicId, a.Type }) 
            .ToListAsync();

        if (!trashAssets.Any()) return;

        var successfullyDeletedIds = new List<int>();

        var resourceTypes = new[] {FileType.Image, FileType.Video, FileType.Audio, FileType.Other };

        // 2. Xóa trên Cloudinary và IngestedAsset bên Python server trước
        foreach (var type in resourceTypes)
        {
            var assetsOfType = trashAssets.Where(a => a.Type == type).ToList();
            if (assetsOfType.Any())
            {
                var publicIds = assetsOfType.Select(a => a.PublicId).Where(pid => !string.IsNullOrEmpty(pid)).ToList();
                if (publicIds.Any())
                {
                    try
                    {
                        foreach (var chunk in publicIds.Chunk(100)) // Chia nhỏ để tránh lỗi quá tải API
                        {
                            await _cloudinaryClient.DeleteFilesAsync(chunk, type);
                            Task.Delay(500).Wait(); // Delay nhẹ để tránh bị rate limit
                        }
                        await _aiApiClient.DeleteIngestedAssetsAsync(assetsOfType.Select(a => a.Id.ToString()).ToList());
                    
                        successfullyDeletedIds.AddRange(assetsOfType.Select(a => a.Id));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi xóa files cho loại {type}", type);
                        // Lỗi mạng thì bỏ qua, ngày mai xe rác chạy lại xóa tiếp
                        throw;
                    }
                }
            }
        }

        // 3. HARD DELETE khỏi Database
        if (successfullyDeletedIds.Any())
        {
            // Dùng ExecuteDeleteAsync để lách cái bẫy SoftDelete trong DbContext
            // DB sẽ tự động Cascade chém bay luôn AssetLinks liên quan
            await _context.Assets
                .IgnoreQueryFilters()
                .Where(a => successfullyDeletedIds.Contains(a.Id))
                .ExecuteDeleteAsync();
        }

        _logger.LogInformation("GarbageCollectorJob đã xóa vĩnh viễn {Count} file rác", successfullyDeletedIds.Count);
    }

    public async Task CleanupOrphanedMedia()
    {
        var groups = await _cloudinaryClient.GetPublicIdsByFolder();
        
        foreach (var group in groups)
        {
            var publicIds = group.PublicIds;
            if (!publicIds.Any()) continue;

            var existingPublicIds = await _context.Assets
                .Where(a => a.Type == group.FileType && publicIds.Contains(a.PublicId))
                .Select(a => a.PublicId)
                .ToListAsync();

            var orphanedPublicIds = publicIds.Except(existingPublicIds).ToList();
            if (orphanedPublicIds.Any())
            {
                try
                {
                    await _cloudinaryClient.DeleteFilesAsync(orphanedPublicIds, group.FileType);
                    _logger.LogInformation("GarbageCollectorJob đã xóa {Count} file mồ côi loại {FileType}", orphanedPublicIds.Count, group.FileType);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi xóa files mồ côi loại {FileType}", group.FileType);
                    // Lỗi mạng thì bỏ qua, ngày mai xe rác chạy lại xóa tiếp
                    throw;
                }
            }
        }
    }
}