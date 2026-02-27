using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Routine;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/routines")]
    [Authorize]
    public class RoutineController : ControllerBase
    {
        private readonly IRoutineService _routineService;
        public RoutineController(IRoutineService RoutineService)
        {
            _routineService = RoutineService;
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ResponseRoutineDto>> GetRoutineById(int id)
        {
            var Routine = await _routineService.GetRoutineByIdAsync(id);
            if (Routine == null) return NotFound();
            return Ok(Routine);
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseRoutineDto>>> GetAllRoutines()
        {
            var Routines = await _routineService.GetRoutinesByUserIdAsync();
            return Ok(Routines);
        }

        [HttpPost]
        public async Task<ActionResult<ResponseRoutineDto>> CreateRoutine([FromBody] RequestRoutineDto RoutineDto)
        {
            var createdRoutine = await _routineService.CreateRoutineAsync(RoutineDto);
            return Ok(createdRoutine);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<ResponseRoutineDto>> UpdateRoutine(int id, [FromBody] RequestRoutineDto RoutineDto)
        {
            var updatedRoutine = await _routineService.UpdateRoutineAsync(id, RoutineDto);
            if (updatedRoutine == null) return NotFound();
            return Ok(updatedRoutine);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRoutine(int id)
        {
            var deleted = await _routineService.DeleteRoutineAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/generate-tasks")]
        public async Task<ActionResult> GenerateTasksForRoutine(int id, [FromQuery] DateTime? upToDate)
        {
            var targetDate = upToDate ?? DateTime.UtcNow.AddDays(14);
            await _routineService.GenerateTasksAsync(id, targetDate);
            return Ok();
        }

        [HttpGet("{id}/upcoming-tasks")]
        public async Task<ActionResult<List<ResponseTaskDto>>> GetUpcomingTasksForRoutine(int id, [FromQuery] int daysAhead = 7)
        {
            var tasks = await _routineService.GetUpcomingTasksAsync(id, daysAhead);
            return Ok(tasks);
        }
    }
}

