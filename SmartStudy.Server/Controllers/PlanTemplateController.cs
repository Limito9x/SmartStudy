using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers;

[ApiController]
[Route("api/templates")]
[Authorize]
public class PlanTemplateController: ControllerBase
{
    private readonly IPlanTemplateService _planTemplateService;
    
    public PlanTemplateController(IPlanTemplateService planTemplateService)
    {
        _planTemplateService = planTemplateService;
    }
    
    [HttpGet(Name = "GetPlanTemplates")]
    public async Task<ActionResult<PagedResult<PlanTemplateDto>>> GetPlanTemplates([FromQuery] TemplateQueryParams queryParams)
    {
        var templates = await _planTemplateService.GetTemplatesAsync(queryParams);
        return Ok(templates);
    }

    [HttpPost(Name = "CreatePlanTemplate")]
    public async Task<ActionResult<PlanTemplateDto>> CreatePlanTemplate([FromBody] CreatePlanTemplateDto createDto)
    {
        var createdTemplate = await _planTemplateService.CreateFromPlanAsync(createDto);
        return Ok(createdTemplate);
    }
    
    [HttpPut("{templateId}", Name = "UpdatePlanTemplate")]
    public async Task<ActionResult<PlanTemplateDto>> UpdatePlanTemplate([FromRoute] int templateId, [FromBody] UpdatePlanTemplateDto updateDto)
    {
        var updatedTemplate = await _planTemplateService.UpdateAsync(templateId, updateDto);
        return Ok(updatedTemplate);
    }
    
    [HttpDelete("{templateId}", Name = "DeletePlanTemplate")]
    public async Task<IActionResult> DeletePlanTemplate([FromRoute] int templateId)
    {
        var result = await _planTemplateService.DeleteAsync(templateId);
        if (!result) return NotFound();
        return NoContent();
    }
    
    [HttpGet("{templateId}", Name = "GetPlanTemplateById")]
    public async Task<ActionResult<PlanTemplateDetailDto>> GetPlanTemplateById([FromRoute] int templateId)
    {
        var template = await _planTemplateService.GetByIdAsync(templateId);
        return Ok(template);
    }
    
    [HttpGet("my", Name = "GetMyPlanTemplates")]
    public async Task<ActionResult<List<PlanTemplateDto>>> GetMyPlanTemplates()
    {
        var templates = await _planTemplateService.GetMyTemplatesAsync();
        return Ok(templates);
    }

    [HttpGet("preview", Name = "PreviewTemplateBySourcePlan")]
    public async Task<ActionResult<PlanTemplateDetailDto>> PreviewTemplateBySourcePlan([FromQuery] int sourcePlanId)
    {
        var preview = await _planTemplateService.PreviewBySourcePlanAsync(sourcePlanId);
        return Ok(preview);
    }
    
    [HttpPost("clone", Name = "ClonePlanTemplate")]
    public async Task<ActionResult> ClonePlanTemplate([FromBody] CloneTemplateDto cloneDto)
    {
        var newPlanId = await _planTemplateService.CloneToStudyPlanAsync(cloneDto);
        return Ok(new { newPlanId });
    }

    [HttpPost("import-courses", Name = "ImportSelectedCourses")]
    public async Task<ActionResult<ImportSelectedCoursesResultDto>> ImportSelectedCourses(
        [FromBody] ImportSelectedCoursesDto importDto)
    {
        var result = await _planTemplateService.ImportSelectedCoursesAsync(importDto);
        return Ok(result);
    }
}