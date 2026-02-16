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
            try
            {
                var taskLog = await _taskLogService.GetTaskLogByIdAsync(taskLogId);
                if (taskLog == null)
                {
                    return NotFound();
                }
                return Ok(taskLog);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ResponseLogDto>> CreateTaskLog([FromBody] RequestLogDto ResponseLogDto)
        {
            try
            {
                var createdTaskLog = await _taskLogService.CreateTaskLogAsync(ResponseLogDto);
                return Ok(createdTaskLog);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{taskLogId}")]
        public async Task<ActionResult<ResponseLogDto>> UpdateTaskLog(int taskLogId, [FromBody] RequestLogDto ResponseLogDto)
        {
            try
            {
                var updatedTaskLog = await _taskLogService.UpdateTaskLogAsync(taskLogId, ResponseLogDto);
                if (updatedTaskLog == null)
                {
                    return NotFound();
                }
                return Ok(updatedTaskLog);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{taskLogId}")]
        public async Task<IActionResult> DeleteTaskLog(int taskLogId)
        {
            try
            {
                var result = await _taskLogService.DeleteTaskLogAsync(taskLogId);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}