using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Services.Cloud;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.AssetService
{
    public interface IAssetService
    {
        public System.Threading.Tasks.Task DeleteAssetAsync(string assetId);
        public Task<AssetResponseDto> UploadAssetAsync(IFormFile file, int linkedId, AssetLinkType assetLinkType);
        public Task<List<AssetResponseDto>> UploadAssetsAsync(UploadAssetDto uploadAssetDto);
        public Task<List<AssetResponseDto>?> GetAssetsAsync(RequestQueryAssetDto queryDto);
    }
    public class AssetService: IAssetService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICloudService _cloudinaryService;
        private readonly IAssetLinkService _assetLinkService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public AssetService(ICloudService cloudinaryService,
            ApplicationDbContext context,
            IMapper mapper, 
            IAssetLinkService assetLinkService,
            ICurrentUserService currentUserService
            )
        {
            _cloudinaryService = cloudinaryService;
            _context = context;
            _mapper = mapper;
            _assetLinkService = assetLinkService;
            _currentUserService = currentUserService;
        }

        public async System.Threading.Tasks.Task DeleteAssetAsync(string assetId)
        {
            var asset = await _context.Assets.FindAsync(int.Parse(assetId)) ??
                throw new Exception("Asset not found");

            await _cloudinaryService.DeleteFileAsync(asset.PublicId, asset.Type);

            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();

        }
        public async Task<AssetResponseDto> UploadAssetAsync(IFormFile file, int LinkedId, AssetLinkType assetLinkType)
        {
            var cloudResult =  _cloudinaryService.UploadFileAsync(file);
            var userId = _currentUserService.UserId;
            var asset = new Asset
            {
                FileName = file.FileName,
                PublicId = cloudResult.Result.PublicId,
                Url = cloudResult.Result.Url,
                Extension = Path.GetExtension(file.FileName),
                FileSize = file.Length,
                Type = FileHelper.GetFileType(file.FileName),
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();
            await _assetLinkService.AddAssetLinkAsync(asset.Id, LinkedId, assetLinkType);
            return _mapper.Map<AssetResponseDto>(asset);
        }
        public async Task<List<AssetResponseDto>> UploadAssetsAsync(UploadAssetDto assetDto)
        {
            var files = assetDto.Files;
            var uploadTasks = files.Select(file => UploadAssetAsync(file, assetDto.LinkedId, assetDto.LinkedType));
            var assetDtos = await System.Threading.Tasks.Task.WhenAll(uploadTasks);
            var assetDtoList = assetDtos.ToList();
            return assetDtoList;
        }
        public async Task<List<AssetResponseDto>?> GetAssetsAsync(RequestQueryAssetDto queryDto)
        {
            var linkedId = queryDto.LinkedId;
            var assetLinkType = queryDto.LinkedType;
            var result = await _context.Assets
                .Include(a => a.AssetLinks)
                .Where(a => a.AssetLinks.Any(al => al.LinkedId == linkedId && al.LinkedType == assetLinkType))
                .ToListAsync();

            return _mapper.Map<List<AssetResponseDto>>(result);
        }
    }
}
