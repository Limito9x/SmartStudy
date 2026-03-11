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
        private readonly IScheduleService _scheduleService;

        public CalendarController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet(Name = "GetCalendar")]
        public async Task<ActionResult<List<CalendarTaskDto>>> GetCalendar(
            [FromQuery] int studyPlanId,
            [FromQuery] DateOnly fromDate,
            [FromQuery] DateOnly toDate)
        {
            var items = await _scheduleService.GetCalendarAsync(studyPlanId, fromDate, toDate);
            return Ok(items);
        }
    }
}

