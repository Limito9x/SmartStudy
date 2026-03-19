using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services
{
    public interface IAssetService
    {
        public Task DeleteAssetAsync(string assetId);
        public Task<AssetResponseDto> UploadAssetAsync(IFormFile file, int linkedId, AssetLinkType assetLinkType);
        public Task<List<AssetResponseDto>> UploadAssetsAsync(UploadAssetDto uploadAssetDto);
        public Task<List<AssetResponseDto>?> GetAssetsAsync(RequestQueryAssetDto queryDto);
        public Task<List<CourseAssetResponseDto>> GetCourseAssetsAsync(int courseId);
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
            var userId = _currentUserService.UserId;
            var uploadedAssets = new List<Asset>();
            var assetLinks = new List<AssetLink>();

            // ==========================================
            // PHASE 1: UPLOAD LÊN CLOUD (CHẠY SONG SONG THỰC SỰ)
            // ==========================================
            var uploadTasks = files.Select(async file => 
            {
                // ⚡ Có chữ await ở đây, các file sẽ đua nhau up lên mây cùng lúc!
                var cloudResult = await _cloudinaryService.UploadFileAsync(file); 
                return new { File = file, CloudResult = cloudResult };
            });

            // Chờ tất cả các file up xong
            var cloudResults = await Task.WhenAll(uploadTasks);

            // ==========================================
            // PHASE 2: LƯU DATABASE (BULK INSERT - 1 LẦN DUY NHẤT)
            // ==========================================
            
            // 2.1 Chuẩn bị list Asset
            foreach(var item in cloudResults)
            {
                uploadedAssets.Add(new Asset
                {
                    FileName = item.File.FileName,
                    PublicId = item.CloudResult.PublicId,
                    Url = item.CloudResult.Url,
                    Extension = Path.GetExtension(item.File.FileName),
                    FileSize = item.File.Length,
                    Type = FileHelper.GetFileType(item.File.FileName),
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                });
            }

            // Lưu cục Asset vào DB (1 phát ăn ngay)
            _context.Assets.AddRange(uploadedAssets);
            await _context.SaveChangesAsync();

            // 2.2 Chuẩn bị list AssetLink (Vì Asset vừa save xong nên đã có Id thật)
            foreach(var asset in uploadedAssets)
            {
                assetLinks.Add(new Entities.AssetLink
                {
                    AssetId = asset.Id,
                    LinkedId = assetDto.LinkedId,
                    LinkedType = assetDto.LinkedType,
                    UserId = userId
                });
            }

            // Lưu cục AssetLink vào DB (Phát thứ 2)
            _context.AssetLinks.AddRange(assetLinks);
            await _context.SaveChangesAsync();

            // ==========================================
            // PHASE 3: TRẢ VỀ DTO CHO UI HIỂN THỊ
            // ==========================================
            return _mapper.Map<List<AssetResponseDto>>(uploadedAssets);
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
        
        // Phác thảo Logic GET Course Assets cho AssetService.cs
        public async Task<List<CourseAssetResponseDto>> GetCourseAssetsAsync(int courseId)
        {
            var userId = _currentUserService.UserId;

            // 1. Lấy danh sách ID của các Task thuộc Course này
            var taskIds = await _context.Tasks
                .Where(t => t.CourseId == courseId && t.UserId == userId)
                .Select(t => t.Id)
                .ToListAsync();

            // 2. Query AssetLink (Bao trọn 2 nguồn)
            var assetLinks = await _context.AssetLinks
                .Include(al => al.Asset)
                .Where(al => al.UserId == userId && 
                             (
                                 (al.LinkedType == AssetLinkType.Course && al.LinkedId == courseId) || 
                                 (al.LinkedType == AssetLinkType.Task && taskIds.Contains(al.LinkedId))
                             ))
                .ToListAsync();

            // 3. Map ra DTO mới có chứa SourceName
            var result = new List<CourseAssetResponseDto>();
            foreach (var link in assetLinks)
            {
                string sourceName = "Tài liệu chung";
                if (link.LinkedType == AssetLinkType.Task)
                {
                    // Phải join hoặc fetch tên Task ra đây
                    var taskName = await _context.Tasks.Where(t => t.Id == link.LinkedId).Select(t => t.Name).FirstOrDefaultAsync();
                    sourceName = $"Đính kèm từ: {taskName}";
                }

                result.Add(new CourseAssetResponseDto 
                {
                    Id = link.Asset.Id,
                    FileName = link.Asset.FileName,
                    Url = link.Asset.Url,
                    Type = link.Asset.Type,
                    CreatedAt = link.Asset.CreatedAt,
                    LinkedType = link.LinkedType, // Để UI biết group
                    SourceName = sourceName // Cực kỳ quan trọng cho UI
                });
            }

            return result;
        }
    }
}
