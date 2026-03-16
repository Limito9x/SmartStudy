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

        [HttpPost("bulk", Name ="BulkCreateStudyPlans")]
        public async Task<IActionResult> BulkCreateStudyPlans([FromBody] BulkCreateStudyPlanDto studyPlanDtos)
        {
            await _studyPlanService.BulkSetupStudyPlansAsync(studyPlanDtos);
            return Ok();
        }

        [HttpGet(Name = "GetStudyPlans")]
        public async Task<ActionResult<List<ResponseStudyPlanDto>>> GetStudyPlans(
            [FromQuery] bool isActive = true)
        {
            var studyPlans = await _studyPlanService.GetStudyPlansByUserIdAsync(isActive);
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

        //[HttpPut("{planId:int}/drafts", Name = "SyncDraftCourses")]
        //public async Task<ActionResult> SyncDraftCourses(int planId, [FromBody] SyncDraftCoursesDto dto)
        //{
        //    await _studyPlanService.SyncDraftCoursesAsync(planId, dto);
        //    return NoContent();
        //}

        //[HttpPatch("{planId:int}/commit", Name = "CommitStudyPlan")]
        //public async Task<ActionResult> CommitStudyPlan(int planId)
        //{
        //    await _studyPlanService.CommitStudyPlanAsync(planId);
        //    return NoContent();
        //}

        [HttpPatch("{planId:int}/status", Name = "UpdateStudyPlanStatus")]
        public async Task<ActionResult> UpdateStudyPlanStatus(int planId, [FromBody] UpdateStudyPlanStatusDto dto)
        {
            await _studyPlanService.UpdateStudyPlanStatusAsync(planId, dto);
            return NoContent();
        }
    }
}

