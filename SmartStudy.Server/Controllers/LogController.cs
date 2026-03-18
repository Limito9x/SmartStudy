using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

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

        [HttpGet("{taskLogId}",Name ="GetLog")]
        public async Task<ActionResult<LogDto>> GetTaskLogById(int taskLogId)
        {
            var taskLog = await _taskLogService.GetTaskLogByIdAsync(taskLogId);
            if (taskLog == null) return NotFound();
            return Ok(taskLog);
        }

        [HttpPut("{taskLogId}",Name ="UpdateLog")]
        public async Task<ActionResult<LogDto>> UpdateTaskLog(int taskLogId, [FromBody] LogWorkDto LogDto)
        {
            var updatedTaskLog = await _taskLogService.UpdateTaskLogAsync(taskLogId, LogDto);
            return Ok(updatedTaskLog);
        }

        [HttpDelete("{taskLogId}",Name ="DeleteLog")]
        public async Task<IActionResult> DeleteTaskLog(int taskLogId)
        {
            var result = await _taskLogService.DeleteTaskLogAsync(taskLogId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}