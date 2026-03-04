using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Schedule;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/schedules")]
    [Authorize]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;
        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpPost(Name = "RegisterSchedule")]
        public async Task<ActionResult> RegisterSchedule(ScheduleRequestDto scheduleDto)
        {
            await _scheduleService.RegisterScheduleAsync(scheduleDto);
            return Ok();
        }

        [HttpGet(Name = "GetSchedules")]
        public async Task<ActionResult<List<ScheduleResponseDto>>> GetSchedules([FromQuery] ScheduleQuery query)
        {
            var schedules = await _scheduleService.GetSchedulesAsync(query);
            return Ok(schedules);
        }

        [HttpGet("semester/{semesterId}", Name = "GetSchedulesBySemester")]
        public async Task<ActionResult<List<ScheduleResponseDto>>> GetSchedulesBySemester(int semesterId)
        {
            var schedules = await _scheduleService.GetCourseSchedulesBySemesterIdAsync(semesterId);
            return Ok(schedules);
        }
    }
}