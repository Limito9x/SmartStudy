using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Data;
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
        private readonly ApplicationDbContext _context;

        public StudyPlanController(IStudyPlanService studyPlanService,
            ApplicationDbContext context)
        {
            _studyPlanService = studyPlanService;
            _context = context;
        }

        [HttpPost(Name = "CreateStudyPlan")]
        public async Task<ActionResult<ResponseStudyPlanDto>> CreateStudyPlan([FromBody] RequestStudyPlanDto studyPlanDto)
        {
            var createdStudyPlan = await _studyPlanService.CreateStudyPlanAsync(studyPlanDto);
            return Ok(createdStudyPlan);
        }

        [HttpGet(Name = "GetStudyPlans")]
        public async Task<ActionResult<List<ResponseStudyPlanDto>>> GetStudyPlans(
            [FromQuery]bool? isActive)
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

        [HttpGet("AcademicContext", Name = "GetAcademicContext")]
        public async Task<ActionResult<AcademicContextDto>> GetAcademicContext()
        {
            var dto = await _studyPlanService.GetAcademicContextAsync();
            return Ok(dto);
        }

        [HttpPatch("{planId:int}/status", Name = "UpdateStudyPlanStatus")]
        public async Task<ActionResult> UpdateStudyPlanStatus(int planId, [FromBody] UpdateStudyPlanStatusDto dto)
        {
            await _studyPlanService.UpdateStudyPlanStatusAsync(planId, dto);
            return NoContent();
        }

        [HttpGet("{planId:int}/stats", Name = "GetStudyPlanStats")]
        public async Task<ActionResult<StudyPlanStatsDto>> GetStudyPlanStats(int planId)
        {
            var stats = await _studyPlanService.GetStudyPlanStatsAsync(planId);
            return Ok(stats);
        }

        [HttpGet("summary-progress", Name = "GetSummaryPlanProgress")]
        public async Task<ActionResult<SummaryPlanProgressDto>> GetSummaryPlanProgress()
        {
            var summary = await _studyPlanService.GetSummaryPlanProgressAsync();
            return Ok(summary);
        }
    }
}

