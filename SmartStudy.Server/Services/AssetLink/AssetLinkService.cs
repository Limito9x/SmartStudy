using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.AssetLink
{
    public interface IAssetLinkService
    {
        System.Threading.Tasks.Task AddAssetLinkAsync(int assetId ,int linkedId, AssetLinkType linkType);
        System.Threading.Tasks.Task RemoveAssetLinkByAsync(int linkedId, AssetLinkType linkType);
    }
    public class AssetLinkService: IAssetLinkService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        public AssetLinkService(ApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async System.Threading.Tasks.Task AddAssetLinkAsync(int assetId,int linkedId, AssetLinkType linkType)
        {
            var userId = _currentUserService.UserId;
            var assetLink = new Entities.AssetLink
            {
                AssetId = assetId,
                LinkedId = linkedId,
                LinkedType = linkType,
                UserId = userId
            };
            _context.AssetLinks.Add(assetLink);
            await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task RemoveAssetLinkByAsync(int linkedId, AssetLinkType linkType)
        {
            var assetLinks = _context.AssetLinks
                .Where(al => al.LinkedId == linkedId && al.LinkedType == linkType).Include(al=>al.Asset);
            _context.AssetLinks.RemoveRange(assetLinks);
            await _context.SaveChangesAsync();
        }
    }
}
