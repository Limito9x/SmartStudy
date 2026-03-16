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

        [HttpGet("Unscheduled", Name = "GetUnscheduledItems")]
        public async Task<ActionResult<List<UnscheduledItemDto>>> GetUnscheduledItems()
        {
            var items = await _calendarService.GetUnscheduledItemsAsync();
            return Ok(items);
        }
    }
}

