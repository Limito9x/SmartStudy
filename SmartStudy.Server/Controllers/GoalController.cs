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

        [HttpPost]
        public async Task<ActionResult<ResponseGoalDto>> CreateGoal(RequestGoalDto GoalDto)
        {
            try
            {
                var createdGoal = await _GoalService.CreateGoalAsync(GoalDto); 
                return Ok(createdGoal);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{GoalId}")]
        public async Task<ActionResult<ResponseGoalDto>> UpdateGoal(int GoalId, RequestGoalDto GoalDto)
        {
            try
            {
                var updatedGoal = await _GoalService.UpdateGoalAsync(GoalId, GoalDto);
                if (updatedGoal == null)
                {
                    return NotFound();
                }
                return Ok(updatedGoal);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{GoalId}")]
        public async Task<IActionResult> DeleteGoal(int GoalId)
        {
            try
            {
                var success = await _GoalService.DeleteGoalAsync(GoalId);
                if (success==null)
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
