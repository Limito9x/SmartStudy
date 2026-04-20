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

    [HttpGet("calendar/context", Name = "GetLearningCalendarContext")]
    [EndpointGroupName("Internal")]
    public async Task<ActionResult<InternalLearningCalendarContextDto>> GetLearningCalendarContext(
        [FromQuery] int userId,
        [FromQuery] int? courseId,
        [FromQuery] int horizonDays = 14)
    {
        if (!IsValidInternalRequest()) return Unauthorized();

        var context = await _internalService.GetLearningCalendarContextAsync(userId, courseId, horizonDays);
        if (context == null) return NotFound();
        return Ok(context);
    }

    [HttpPost("phase/preview", Name = "SuggestPhasePreview")]
    [EndpointGroupName("Internal")]
    public async Task<ActionResult<InternalPhasePreviewDto>> SuggestPhasePreview(
        [FromBody] InternalPhasePreviewRequestDto request)
    {
        if (!IsValidInternalRequest()) return Unauthorized();

        var preview = await _internalService.SuggestPhasePreviewAsync(request);
        if (preview == null) return NotFound();
        return Ok(preview);
    }
}