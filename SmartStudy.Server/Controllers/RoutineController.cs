using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services;

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
        [HttpGet("{id}", Name ="GetRoutineById")]
        public async Task<ActionResult<ResponseRoutineDto>> GetRoutineById(int id)
        {
            var Routine = await _routineService.GetRoutineByIdAsync(id);
            if (Routine == null) return NotFound();
            return Ok(Routine);
        }

        [HttpGet(Name ="GetRoutines")]
        public async Task<ActionResult<List<SimpleResponseRoutineDto>>> GetAllRoutines(
            [FromQuery] int? StudyPlanId,
            [FromQuery] int? phaseId,
            [FromQuery] TaskType? Type
            )
        {
            var Routines = await _routineService.GetRoutinesByUserIdAsync(StudyPlanId, phaseId, Type);
            return Ok(Routines);
        }

        [HttpPost(Name ="CreateRoutine")]
        public async Task<ActionResult<ResponseRoutineDto>> CreateRoutine([FromBody] RequestRoutineDto RoutineDto)
        {
            var createdRoutine = await _routineService.CreateRoutineAsync(RoutineDto);
            return Ok(createdRoutine);
        }

        [HttpPatch("{id}",Name ="UpdateRoutine")]
        public async Task<ActionResult<ResponseRoutineDto>> UpdateRoutine(int id, [FromBody] RequestRoutineDto RoutineDto)
        {
            var updatedRoutine = await _routineService.UpdateRoutineAsync(id, RoutineDto);
            if (updatedRoutine == null) return NotFound();
            return Ok(updatedRoutine);
        }

        [HttpDelete("{id}",Name ="DeleteRoutine")]
        public async Task<ActionResult> DeleteRoutine(int id)
        {
            var deleted = await _routineService.DeleteRoutineAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/generate-tasks",Name ="GenerateTasks")]
        public async Task<ActionResult> GenerateTasksForRoutine(int id, [FromQuery] DateTime? upToDate)
        {
            var targetDate = upToDate ?? DateTime.UtcNow.AddDays(14);
            await _routineService.GenerateTasksAsync(id, targetDate);
            return Ok();
        }

        [HttpGet("{id}/upcoming-tasks",Name ="GetUpcomingRoutineTasks")]
        public async Task<ActionResult<List<ResponseTaskDto>>> GetUpcomingTasksForRoutine(int id, [FromQuery] int daysAhead = 7)
        {
            var tasks = await _routineService.GetUpcomingTasksAsync(id, daysAhead);
            return Ok(tasks);
        }

        [HttpPost("{id}/toggle-status", Name = "ToggleRoutineStatus")]
        public async Task<ActionResult<ResponseRoutineDto>> ToggleRoutineStatus(int id)
        {
            var updatedRoutine = await _routineService.ToggleRoutineStatusAsync(id);
            return Ok(updatedRoutine);
        }
    }
}

