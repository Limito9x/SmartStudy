using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly ICalendarService _calendarService;

        public CalendarController(ICalendarService scheduleService)
        {
            _calendarService = scheduleService;
        }

        [HttpGet(Name = "GetCalendar")]
        public async Task<ActionResult<List<CalendarEventDto>>> GetCalendar(
            [FromQuery] DateOnly fromDate,
            [FromQuery] DateOnly toDate)
        {
            var items = await _calendarService.GetCalendarAsync(fromDate, toDate);
            return Ok(items);
        }

        [HttpGet("inbox", Name = "GetInboxItems")]
        public async Task<ActionResult<InboxResponseDto>> GetInboxItems()
        {
            var items = await _calendarService.GetInboxItemsAsync();
            return Ok(items);
        }
        
        [HttpPatch("Reschedule", Name = "RescheduleCalendar")]
        public async Task<ActionResult> RescheduleCalendar([FromBody] RescheduleTaskDto rescheduleDto)
        {
            await _calendarService.RescheduleTaskAsync(rescheduleDto);
            return NoContent();
        }
    }
}

