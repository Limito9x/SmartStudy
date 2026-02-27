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
            var learningPaths = await _learningPathService.GetLearningPathsByUserIdAsync();
            return Ok(learningPaths);
        }

        [HttpGet("{LearningPathId}")]
        public async Task<ActionResult<ResponseLearningPathDto>> GetLearningPathById(int LearningPathId)
        {
            var learningPath = await _learningPathService.GetLearningPathByIdAsync(LearningPathId);
            if (learningPath == null) return NotFound();
            return Ok(learningPath);
        }

        [HttpPost]
        public async Task<ActionResult<ResponseLearningPathDto>> CreateLearningPath(RequestLearningPathDto learningPathDto)
        {
            var createdLearningPath = await _learningPathService.CreateLearningPathAsync(learningPathDto);
            return Ok(createdLearningPath);
        }

        [HttpPatch("{LearningPathId}")]
        public async Task<ActionResult<ResponseLearningPathDto>> UpdateLearningPath(int LearningPathId, RequestLearningPathDto learningPathDto)
        {
            var updatedLearningPath = await _learningPathService.UpdateLearningPathAsync(LearningPathId, learningPathDto);
            if (updatedLearningPath == null) return NotFound();
            return Ok(updatedLearningPath);
        }

        [HttpDelete("{LearningPathId}")]
        public async Task<IActionResult> DeleteLearningPath(int LearningPathId)
        {
            var success = await _learningPathService.DeleteLearningPathAsync(LearningPathId);
            if (success == null) return NotFound();
            return NoContent();
        }
    }
}
