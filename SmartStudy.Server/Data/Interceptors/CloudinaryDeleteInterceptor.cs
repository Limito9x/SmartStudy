using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Services.Cloud;

namespace SmartStudy.Server.Data.Interceptors
{
    public class CloudinaryDeleteInterceptor : SaveChangesInterceptor
    {
        private readonly ICloudService _cloudinaryService;

        public CloudinaryDeleteInterceptor(ICloudService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        // Hàm này chạy TRƯỚC khi dữ liệu bị xóa trong DB
        // Nhưng an toàn nhất là chạy SAU khi DB đã xóa thành công (SavedChanges)
        // Tuy nhiên, nếu xóa DB xong mới xóa ảnh, mà xóa DB thành công nhưng xóa ảnh lỗi thì sao?
        // Thường người ta chấp nhận rác trên Cloudinary hơn là mất dữ liệu DB. 
        // Ở đây mình demo cách chạy đồng thời.

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var context = eventData.Context;
            if (context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

            // 1. Tìm tất cả các Asset đang ở trạng thái DELETED
            var deletedAssets = context.ChangeTracker.Entries<Asset>()
                .Where(e => e.State == EntityState.Deleted)
                .Select(e => e.Entity)
                .ToList();

            // 2. Nếu có file bị xóa
            if (deletedAssets.Any())
            {
                foreach (var asset in deletedAssets)
                {
                    // Cloudinary cần PublicId để xóa
                    if (!string.IsNullOrEmpty(asset.PublicId))
                    {
                        // Fire and forget (Chạy ngầm không đợi) hoặc Await tùy nhu cầu
                        await _cloudinaryService.DeleteFileAsync(asset.PublicId, asset.Type);
                    }
                }
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}