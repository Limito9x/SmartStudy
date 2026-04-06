using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Authorize]
    public class TimelineEventController : ControllerBase
    {
        private readonly ITimelineEventService _timelineEventService;

        public TimelineEventController(ITimelineEventService timelineEventService)
        {
            _timelineEventService = timelineEventService;
        }

        [HttpPost(Name = "CreateEvent")]
        public async Task<ActionResult<ResponseTimelineEventDto>> Create([FromBody] RequestTimelineEventDto dto)
        {
            var created = await _timelineEventService.CreateAsync(dto);
            return Ok(created);
        }

        [HttpGet(Name = "GetEvents")]
        public async Task<ActionResult<List<ResponseTimelineEventDto>>> GetByCourse(
            [FromQuery] int? studyPlanId, int? courseId)
        {
            var events = await _timelineEventService.GetEventsAsync(studyPlanId, courseId);
            return Ok(events);
        }
        
        [HttpGet("{eventId:int}", Name = "GetEventById")]
        public async Task<ActionResult<ResponseTimelineEventDto>> GetById(int eventId)
        {
            var timelineEvent = await _timelineEventService.GetByIdAsync(eventId);
            if (timelineEvent == null) return NotFound();
            return Ok(timelineEvent);
        }

        [HttpPatch("{timelineEventId:int}", Name = "UpdateEvent")]
        public async Task<ActionResult<ResponseTimelineEventDto>> Update(int timelineEventId, [FromBody] RequestTimelineEventDto dto)
        {
            var updated = await _timelineEventService.UpdateAsync(timelineEventId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{timelineEventId:int}", Name = "DeleteEvent")]
        public async Task<IActionResult> Delete(int timelineEventId)
        {
            var deleted = await _timelineEventService.DeleteAsync(timelineEventId);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}

