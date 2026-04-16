using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/phases")]
    [Authorize]
    public class PhaseController : ControllerBase
    {
        private readonly IPhaseService _timelineEventService;

        public PhaseController(IPhaseService timelineEventService)
        {
            _timelineEventService = timelineEventService;
        }

        [HttpPost(Name = "CreatePhase")]
        public async Task<ActionResult<ResponsePhaseDto>> Create([FromBody] RequestPhaseDto dto)
        {
            var created = await _timelineEventService.CreateAsync(dto);
            return Ok(created);
        }

        [HttpGet(Name = "GetPhases")]
        public async Task<ActionResult<List<ResponsePhaseDto>>> GetByCourse(
            [FromQuery] int? studyPlanId, int? courseId)
        {
            var events = await _timelineEventService.GetEventsAsync(studyPlanId, courseId);
            return Ok(events);
        }
        
        [HttpGet("{phaseId:int}", Name = "GetPhaseById")]
        public async Task<ActionResult<ResponsePhaseDto>> GetById(int phaseId)
        {
            var timelineEvent = await _timelineEventService.GetByIdAsync(phaseId);
            if (timelineEvent == null) return NotFound();
            return Ok(timelineEvent);
        }

        [HttpPatch("{phaseId:int}", Name = "UpdatePhase")]
        public async Task<ActionResult<ResponsePhaseDto>> Update(int phaseId, [FromBody] RequestPhaseDto dto)
        {
            var updated = await _timelineEventService.UpdateAsync(phaseId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{phaseId:int}", Name = "DeletePhase")]
        public async Task<IActionResult> Delete(int phaseId)
        {
            var deleted = await _timelineEventService.DeleteAsync(phaseId);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}

