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
            try
            {
                var Routine = await _routineService.GetRoutineByIdAsync(id);
                if (Routine == null)
                {
                    return NotFound();
                }
                return Ok(Routine);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseRoutineDto>>> GetAllRoutines()
        {
            try
            {
                var Routines = await _routineService.GetRoutinesByUserIdAsync();
                return Ok(Routines);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ResponseRoutineDto>> CreateRoutine([FromBody] RequestRoutineDto RoutineDto)
        {
            try
            {
                var createdRoutine = await _routineService.CreateRoutineAsync(RoutineDto);
                return Ok(createdRoutine);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error creating Routine: " + ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<ResponseRoutineDto>> UpdateRoutine(int id, [FromBody] RequestRoutineDto RoutineDto)
        {
            try
            {
                var updatedRoutine = await _routineService.UpdateRoutineAsync(id, RoutineDto);
                if (updatedRoutine == null)
                {
                    return NotFound();
                }
                return Ok(updatedRoutine);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRoutine(int id)
        {
            try
            {
                var deleted = await _routineService.DeleteRoutineAsync(id);
                if (!deleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/generate-tasks")]
        public async Task<ActionResult> GenerateTasksForRoutine(int id, [FromQuery] DateTime? upToDate)
        {
            try
            {
                var targetDate = upToDate ?? DateTime.UtcNow.AddDays(14);
                await _routineService.GenerateTasksAsync(id, targetDate);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/upcoming-tasks")]
        public async Task<ActionResult<List<ResponseTaskDto>>> GetUpcomingTasksForRoutine(int id, [FromQuery] int daysAhead = 7)
        {
            try
            {
                var tasks = await _routineService.GetUpcomingTasksAsync(id, daysAhead);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

