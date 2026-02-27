using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.TaskLog;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/logs")]
    [Authorize]
    public class LogController : ControllerBase
    {
        private readonly ILogService _taskLogService;
        public LogController(ILogService taskLogService)
        {
            _taskLogService = taskLogService;
        }

        [HttpGet("{taskLogId}")]
        public async Task<ActionResult<ResponseLogDto>> GetTaskLogById(int taskLogId)
        {
            var taskLog = await _taskLogService.GetTaskLogByIdAsync(taskLogId);
            if (taskLog == null) return NotFound();
            return Ok(taskLog);
        }

        [HttpPost]
        public async Task<ActionResult<ResponseLogDto>> CreateTaskLog([FromBody] RequestLogDto ResponseLogDto)
        {
            var createdTaskLog = await _taskLogService.CreateTaskLogAsync(ResponseLogDto);
            return Ok(createdTaskLog);
        }

        [HttpPut("{taskLogId}")]
        public async Task<ActionResult<ResponseLogDto>> UpdateTaskLog(int taskLogId, [FromBody] RequestLogDto ResponseLogDto)
        {
            var updatedTaskLog = await _taskLogService.UpdateTaskLogAsync(taskLogId, ResponseLogDto);
            if (updatedTaskLog == null) return NotFound();
            return Ok(updatedTaskLog);
        }

        [HttpDelete("{taskLogId}")]
        public async Task<IActionResult> DeleteTaskLog(int taskLogId)
        {
            var result = await _taskLogService.DeleteTaskLogAsync(taskLogId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}