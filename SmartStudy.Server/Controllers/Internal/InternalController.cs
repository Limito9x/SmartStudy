using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Services;

[ApiController]
[Route("api/internal")]
public class InternalController: ControllerBase
{
    private readonly IInternalService _internalService;

    public InternalController(IInternalService internalService)
    {
        _internalService = internalService;
    }

    [HttpGet("allowed-assets", Name = "GetAllowedAssets")]
    [EndpointGroupName("Retrieval")]
    public async Task<ActionResult<List<int>>> GetAllowedAssets([FromQuery] int userId, [FromQuery] int? courseId)
    {
        var result = await _internalService.GetAllowedAssetsAsync(userId, courseId);
        return Ok(result ?? new List<int>());
    }
}