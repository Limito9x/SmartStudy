using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TaskController: ControllerBase
    {
        private readonly ITaskService _TaskService;

        public TaskController(ITaskService Taskservice)
        {
            _TaskService = Taskservice;
        }

        [HttpPost]
        public async Task<ActionResult<ResponseTaskDto>> CreateTask([FromBody] RequestTaskDto dto)
        {
            Console.WriteLine("Creating task with DTO: "+ dto);
            var created = await _TaskService.CreateTaskAsync(dto);
            return Ok(created);
        }

        [HttpGet("{taskId}")]
        public async Task<ActionResult<ResponseTaskDto>> GetTaskById(int taskId)
        {
            var task = await _TaskService.GetTaskByIdAsync(taskId);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPatch("{taskId}",Name ="UpdateTaskInfo")]
        public async Task<ActionResult<ResponseTaskDto>> UpdateTaskInfo(int taskId, [FromBody] RequestTaskDto dto)
        {
            var updated = await _TaskService.UpdateTaskInfoAsync(taskId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpPatch("{taskId}/status")]
        public async Task<ActionResult<ResponseTaskDto>> UpdateTaskStatus(int taskId, [FromBody] TaskStatusDto dto)
        {
            ResponseTaskDto updated = await _TaskService.UpdateTaskStatusAsync(taskId, dto);
            return Ok(updated);
        }

        [HttpPost("{taskId}/logs")]
        public async Task<ActionResult<ResponseTaskDto>> LogWork(int taskId, [FromBody] LogWorkDto dto)
        {
            var executed = await _TaskService.LogWorkAsync(taskId, dto);
            if (executed == null) return NotFound();
            return Ok(executed);
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTaskById(int taskId)
        {
            var isDeleted = await _TaskService.DeleteTaskByIdAsync(taskId);
            if (!isDeleted) return NotFound();
            return NoContent();
        }
    }
}
