using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.TaskItem;

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
            Console.WriteLine("Creating task with DTO: "+ dto);
            var created = await _Taskservice.CreateTaskAsync(dto);
            return Ok(created);
        }

        [HttpGet("{taskId}")]
        public async Task<ActionResult<ResponseTaskDto>> GetTaskById(int taskId)
        {
            var task = await _Taskservice.GetTaskByIdAsync(taskId);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPatch("{taskId}")]
        public async Task<ActionResult<ResponseTaskDto>> UpdateTaskById(int taskId, [FromBody] RequestTaskDto dto)
        {
            var updated = await _Taskservice.UpdateTaskByIdAsync(taskId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpPost("{taskId}/execute")]
        public async Task<ActionResult<ResponseTaskDto>> ExecuteTaskById(int taskId, [FromBody] ExecuteTaskDto dto)
        {
            var executed = await _Taskservice.ExecuteTaskByIdAsync(taskId, dto);
            if (executed == null) return NotFound();
            return Ok(executed);
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTaskById(int taskId)
        {
            var isDeleted = await _Taskservice.DeleteTaskByIdAsync(taskId);
            if (!isDeleted) return NotFound();
            return NoContent();
        }
    }
}
