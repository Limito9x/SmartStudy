using SmartStudy.Server.Services.Goal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.LearningPath;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/learning-paths")]
    [Authorize]
    public class LearningPathController : ControllerBase
    {
        private readonly ILearningPathService _learningPathService;

        public LearningPathController(ILearningPathService learningPathService)
        {
            _learningPathService = learningPathService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseLearningPathDto>>> GetLearningPaths()
        {
            try
            {
                var learningPaths = await _learningPathService.GetLearningPathsByUserIdAsync();
                return Ok(learningPaths);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{LearningPathId}")]
        public async Task<ActionResult<ResponseLearningPathDto>> GetLearningPathById(int LearningPathId)
        {
            try
            {
                var learningPath = await _learningPathService.GetLearningPathByIdAsync(LearningPathId);
                if (learningPath == null)
                {
                    return NotFound();
                }
                return Ok(learningPath);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ResponseLearningPathDto>> CreateLearningPath(RequestLearningPathDto learningPathDto)
        {
            try
            {
                var createdLearningPath = await _learningPathService.CreateLearningPathAsync(learningPathDto);
                return Ok(createdLearningPath);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{LearningPathId}")]
        public async Task<ActionResult<ResponseLearningPathDto>> UpdateLearningPath(int LearningPathId, RequestLearningPathDto learningPathDto)
        {
            try
            {
                var updatedLearningPath = await _learningPathService.UpdateLearningPathAsync(LearningPathId, learningPathDto);
                if (updatedLearningPath == null)
                {
                    return NotFound();
                }
                return Ok(updatedLearningPath);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{LearningPathId}")]
        public async Task<IActionResult> DeleteLearningPath(int LearningPathId)
        {
            try
            {
                var success = await _learningPathService.DeleteLearningPathAsync(LearningPathId);
                if (success == null)
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
    }
}
