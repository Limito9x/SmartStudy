using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services;
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

        [HttpGet(Name = "GetAssets")]
        public async Task<ActionResult<List<AssetResponseDto>>> GetAssets(
            [FromQuery] int linkedId, 
            [FromQuery] AssetLinkType linkedType)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var queryDto = new RequestQueryAssetDto(linkedId, linkedType);
            var assets = await _assetService.GetAssetsAsync(queryDto);
            return Ok(assets);
        }

        [HttpPost(Name="UploadAssets")]
        public async Task<ActionResult<List<AssetResponseDto>>> UploadAssets([FromForm] UploadAssetDto uploadAssetDto)
        {
            var uploadedAssets = await _assetService.UploadAssetsAsync(uploadAssetDto);
            return Ok(uploadedAssets);
        }

        [HttpDelete("{assetId}",Name ="DeleteAsset")]
        public async Task<ActionResult> DeleteAsset(string assetId)
        {
            await _assetService.DeleteAssetAsync(assetId);
            return NoContent();
        }
    }
}
