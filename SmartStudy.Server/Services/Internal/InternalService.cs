using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services;

public interface IInternalService
{
    Task<List<int>?> GetAllowedAssetsAsync(int userId, int? courseId);
}

public class InternalService: IInternalService
{
    private readonly ApplicationDbContext _context;
    
    public InternalService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<int>?> GetAllowedAssetsAsync(int userId, int? courseId)
    { 
        var taskIds = await _context.Tasks
            .Where(t => t.CourseId == courseId && t.UserId == userId)
            .Select(t => t.Id)
            .ToListAsync();
        
        var logIds = await _context.Logs
            .Where(l => taskIds.Contains(l.TaskId))
            .Select(l => l.Id).ToListAsync();

        // 2. Lấy danh sách AssetId của khóa học
        var allRelatedAssetIds = await _context.AssetLinks
            .Where(al =>
                (al.LinkedType == AssetLinkType.Course && al.LinkedId == courseId) ||
                (al.LinkedType == AssetLinkType.Task && taskIds.Contains(al.LinkedId)) ||
                (al.LinkedType == AssetLinkType.Log && logIds.Contains(al.LinkedId)))
            .Select(al => al.AssetId)
            .Distinct()
            .ToListAsync();

        return allRelatedAssetIds;
    }
}