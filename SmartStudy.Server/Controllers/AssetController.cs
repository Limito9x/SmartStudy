using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.AssetService;
using System.Security.Claims;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/assets")]
    [Authorize]
    public class AssetController : ControllerBase
    {
        private readonly IAssetService _assetService;
        public AssetController(IAssetService assetService)
        {
            _assetService = assetService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AssetResponseDto>>> GetAssets([FromQuery] RequestQueryAssetDto queryDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var assets = await _assetService.GetAssetsAsync(queryDto);
            return Ok(assets);
        }

        [HttpPost]
        public async Task<ActionResult<List<AssetResponseDto>>> UploadAssets([FromForm] UploadAssetDto uploadAssetDto)
        {
            var uploadedAssets = await _assetService.UploadAssetsAsync(uploadAssetDto);
            return Ok(uploadedAssets);
        }

        [HttpDelete("{assetId}")]
        public async Task<ActionResult> DeleteAsset(string assetId)
        {
            await _assetService.DeleteAssetAsync(assetId);
            return NoContent();
        }
    }
}
