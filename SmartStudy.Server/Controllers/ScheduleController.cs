using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

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

        [HttpPost(Name = "CreateSchedule")]
        public async Task<ActionResult<ResponseScheduleDto>> Create([FromBody] RequestScheduleDto dto)
        {
            var created = await _scheduleService.CreateAsync(dto);
            return Ok(created);
        }

        [HttpPatch("{id:int}", Name = "UpdateSchedule")]
        public async Task<ActionResult<ResponseScheduleDto>> Update(int id, [FromBody] UpdateScheduleDto dto)
        {
            var updated = await _scheduleService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:int}", Name = "DeleteSchedule")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _scheduleService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("{id:int}/confirm", Name = "ConfirmTaskOnOccurrence")]
        public async Task<IActionResult> ConfirmTaskOnOccurrence(int id, [FromQuery] DateOnly taskDate)
        {
            await _scheduleService.ConfirmTaskOnOccurrence(id, taskDate);
            return NoContent();
        }
    }
}

