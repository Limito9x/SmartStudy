using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Entities.Interfaces;

namespace SmartStudy.Server.Data;

    public static class DbContextExtension
    {
        public static async Task CascadeSoftDeleteLinkAsync(
            this ApplicationDbContext context,
            int linkedId,
            AssetLinkType linkType)
        {
            await context.AssetLinks
                .Where(al => al.LinkedId == linkedId && al.LinkedType == linkType)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, DateTime.UtcNow));
        }
        
        public static async Task CascadeSoftDeleteLinkAsync(
            this ApplicationDbContext context,
            IEnumerable<int> linkedIds,
            AssetLinkType linkType)
        {
            await context.AssetLinks
                .Where(al => linkedIds.Contains(al.LinkedId) && al.LinkedType == linkType)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, DateTime.UtcNow));
        }
        
        public static async Task SoftDeleteBulkAsync<T>(this IQueryable<T> query) 
            where T : class, ISoftDeletable
        {
            await query.ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, DateTime.UtcNow));
        }
    }