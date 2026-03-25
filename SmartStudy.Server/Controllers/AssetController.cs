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
        
        [HttpGet("Course/{courseId:int}",Name ="GetCourseAsset")]
        public async Task<ActionResult<List<CourseAssetResponseDto>>> GetCourseAssets(int courseId)
        {
            var assets = await _assetService.GetCourseAssetsAsync(courseId);
            return Ok(assets);
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
        public async Task<ActionResult<List<AssetResponseDto>>> UploadAssets(
            [FromForm] IFormFileCollection file,
            [FromForm] int linkedId,
            [FromForm] AssetLinkType linkedType,
            [FromForm] AssetLinkCategory category = AssetLinkCategory.Reference)
        {
            Console.WriteLine($"Received {file.Count} files for upload. LinkedId: {linkedId}, LinkedType: {linkedType}, Category: {category}");
            var dto = new UploadAssetDto(file.ToList(), linkedId, linkedType, category, null);
            var uploadedAssets = await _assetService.UploadAssetsAsync(dto);
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
