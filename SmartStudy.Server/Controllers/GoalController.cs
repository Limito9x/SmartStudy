using SmartStudy.Server.Services.Goal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/goals")]
    [Authorize]
    public class GoalController: ControllerBase
    {
        private readonly IGoalService _GoalService;

        public GoalController(IGoalService GoalService)
        {
            _GoalService = GoalService;
        }

        [HttpPost(Name = "CreateGoal")]
        public async Task<ActionResult<ResponseGoalDto>> CreateGoal(RequestGoalDto GoalDto)
        {
            var createdGoal = await _GoalService.CreateGoalAsync(GoalDto); 
            return Ok(createdGoal);
        }

        [HttpPatch("{goalId}", Name = "UpdateGoal")]
        public async Task<ActionResult<ResponseGoalDto>> UpdateGoal(int goalId, RequestGoalDto GoalDto)
        {
            var updatedGoal = await _GoalService.UpdateGoalAsync(goalId, GoalDto);
            if (updatedGoal == null) return NotFound();
            return Ok(updatedGoal);
        }

        [HttpDelete("{goalId}", Name = "DeleteGoal")]
        public async Task<IActionResult> DeleteGoal(int goalId)
        {
            var success = await _GoalService.DeleteGoalAsync(goalId);
            if (success == null) return NotFound();
            return NoContent();
        }
        }
}
