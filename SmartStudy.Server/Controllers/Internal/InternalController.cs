using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Services;
using SmartStudy.Server.Dtos;

[ApiController]
[Route("api/internal")]
public class InternalController: ControllerBase
{
    private readonly IInternalService _internalService;
    private readonly IConfiguration _configuration;

    public InternalController(IInternalService internalService, IConfiguration configuration)
    {
        _internalService = internalService;
        _configuration = configuration;
    }

    private bool IsValidInternalRequest()
    {
        var providedKey = Request.Headers["X-Internal-Service-Key"].FirstOrDefault();
        var expectedKey = _configuration["InternalServiceKey"];
        return !string.IsNullOrWhiteSpace(expectedKey)
               && !string.IsNullOrWhiteSpace(providedKey)
               && providedKey == expectedKey;
    }

    [HttpGet("allowed-assets", Name = "GetAllowedAssets")]
    [EndpointGroupName("Retrieval")]
    public async Task<ActionResult<List<int>>> GetAllowedAssets([FromQuery] int userId, [FromQuery] int? courseId)
    {
        if (!IsValidInternalRequest()) return Unauthorized();

        var result = await _internalService.GetAllowedAssetsAsync(userId, courseId);
        return Ok(result ?? new List<int>());
    }

    [HttpGet("progress/active-study-plan", Name = "GetActiveStudyPlanProgress")]
    [EndpointGroupName("Internal")]
    public async Task<ActionResult<InternalStudyPlanProgressDto>> GetActiveStudyPlanProgress([FromQuery] int userId)
    {
        if (!IsValidInternalRequest()) return Unauthorized();

        var progress = await _internalService.GetActiveStudyPlanProgressAsync(userId);
        if (progress == null) return NotFound();
        return Ok(progress);
    }

    [HttpGet("progress/course", Name = "GetCourseProgress")]
    [EndpointGroupName("Internal")]
    public async Task<ActionResult<InternalCourseProgressDto>> GetCourseProgress(
        [FromQuery] int userId,
        [FromQuery] int courseId,
        [FromQuery] bool includeInactive = false)
    {
        if (!IsValidInternalRequest()) return Unauthorized();

        var progress = await _internalService.GetCourseProgressAsync(userId, courseId, includeInactive);
        if (progress == null) return NotFound();
        return Ok(progress);
    }
}