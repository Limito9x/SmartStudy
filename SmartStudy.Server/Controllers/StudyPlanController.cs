using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/study-plans")]
    [Authorize]
    public class StudyPlanController : ControllerBase
    {
        private readonly IStudyPlanService _studyPlanService;

        public StudyPlanController(IStudyPlanService studyPlanService)
        {
            _studyPlanService = studyPlanService;
        }

        [HttpPost(Name = "CreateStudyPlan")]
        public async Task<ActionResult<ResponseStudyPlanDto>> CreateStudyPlan([FromBody] RequestStudyPlanDto studyPlanDto)
        {
            var createdStudyPlan = await _studyPlanService.CreateStudyPlanAsync(studyPlanDto);
            return Ok(createdStudyPlan);
        }

        [HttpGet(Name = "GetStudyPlans")]
        public async Task<ActionResult<List<ResponseStudyPlanDto>>> GetStudyPlans()
        {
            var studyPlans = await _studyPlanService.GetStudyPlansByUserIdAsync();
            return Ok(studyPlans);
        }

        [HttpGet("{studyPlanId:int}", Name = "GetStudyPlanById")]
        public async Task<ActionResult<ResponseStudyPlanDto>> GetStudyPlanById(int studyPlanId)
        {
            var studyPlan = await _studyPlanService.GetStudyPlanByIdAsync(studyPlanId);
            if (studyPlan == null) return NotFound();
            return Ok(studyPlan);
        }

        [HttpPut("{studyPlanId:int}", Name = "UpdateStudyPlan")]
        public async Task<ActionResult<ResponseStudyPlanDto>> UpdateStudyPlan(int studyPlanId, [FromBody] RequestStudyPlanDto studyPlanDto)
        {
            var updatedStudyPlan = await _studyPlanService.UpdateStudyPlanAsync(studyPlanId, studyPlanDto);
            if (updatedStudyPlan == null) return NotFound();
            return Ok(updatedStudyPlan);
        }

        [HttpDelete("{studyPlanId:int}", Name = "DeleteStudyPlan")]
        public async Task<ActionResult> DeleteStudyPlan(int studyPlanId)
        {
            var result = await _studyPlanService.DeleteStudyPlanAsync(studyPlanId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}

