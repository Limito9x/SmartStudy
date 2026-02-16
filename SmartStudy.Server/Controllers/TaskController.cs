using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Task;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TaskController: ControllerBase
    {
        private readonly ITaskService _Taskservice;

        public TaskController(ITaskService Taskservice)
        {
            _Taskservice = Taskservice;
        }

        [HttpPost]
        public async Task<ActionResult<ResponseTaskDto>> CreateTask([FromBody] RequestTaskDto dto)
        {
            try
            {
                Console.WriteLine("Creating task with DTO: "+ dto);
                var created = await _Taskservice.CreateTaskAsync(dto);
                return Ok(created);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error creating task: " + ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{taskId}")]
        public async Task<ActionResult<ResponseTaskDto>> GetTaskById(int taskId)
        {
            try
            {
                var task = await _Taskservice.GetTaskByIdAsync(taskId);
                if (task == null)
                {
                    return NotFound();
                }
                return Ok(task);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{taskId}")]
        public async Task<ActionResult<ResponseTaskDto>> UpdateTaskById(int taskId, [FromBody] RequestTaskDto dto)
        {
            try
            {
                var updated = await _Taskservice.UpdateTaskByIdAsync(taskId, dto);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{taskId}/execute")]
        public async Task<ActionResult<ResponseTaskDto>> ExecuteTaskById(int taskId, [FromBody] ExecuteTaskDto dto)
        {
            try
            {
                var executed = await _Taskservice.ExecuteTaskByIdAsync(taskId, dto);
                if (executed == null)
                {
                    return NotFound();
                }
                return Ok(executed);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTaskById(int taskId)
        {
            try
            {
                var isDeleted = await _Taskservice.DeleteTaskByIdAsync(taskId);
                if (!isDeleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
