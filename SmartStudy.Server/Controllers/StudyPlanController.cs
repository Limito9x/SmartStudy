using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpPost("bulk", Name ="BulkCreateStudyPlans")]
        public async Task<IActionResult> BulkCreateStudyPlans([FromBody] BulkCreateStudyPlanDto studyPlanDtos)
        {
            await _studyPlanService.BulkSetupStudyPlansAsync(studyPlanDtos);
            return Ok();
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
            var terms = await _context.AcademicTerms.OrderBy(t => t.TermNumber).ToListAsync();
            var years = await _context.AcademicYears
                .Where(y => y.StartYear <= DateTime.UtcNow.Year + 1)
                .OrderByDescending(y => y.StartYear).ToListAsync();

            var dto = new AcademicContextDto
            {
                Terms = terms,
                Years = years
            };
            return Ok(dto);
        }

        [HttpPatch("{planId:int}/status", Name = "UpdateStudyPlanStatus")]
        public async Task<ActionResult> UpdateStudyPlanStatus(int planId, [FromBody] UpdateStudyPlanStatusDto dto)
        {
            await _studyPlanService.UpdateStudyPlanStatusAsync(planId, dto);
            return NoContent();
        }
    }
}

