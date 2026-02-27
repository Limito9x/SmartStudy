using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Semester;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/semesters")]
    [Authorize]
    public class SemesterController : ControllerBase
    {
        private readonly ISemesterService _SemesterService;

        public SemesterController(ISemesterService SemesterService)
        {
            _SemesterService = SemesterService;
        }

        [HttpPost]
        public async Task<ActionResult<ResponseSemesterDto>> CreateSemester([FromBody] RequestSemesterDto SemesterDto)
        {
            var createdSemester = await _SemesterService.CreateSemesterAsync(SemesterDto);
            return Ok(createdSemester);
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseSemesterDto>>> GetSemesters()
        {
            var Semesters = await _SemesterService.GetSemestersByUserIdAsync();
            return Ok(Semesters);
        }

        [HttpGet("{SemesterId}")]
        public async Task<ActionResult<ResponseSemesterDto>> GetSemesterById(int SemesterId)
        {
            var Semester = await _SemesterService.GetSemesterByIdAsync(SemesterId);
            if (Semester == null) return NotFound();
            return Ok(Semester);
        }

        [HttpPut("{SemesterId}")]
        public async Task<ActionResult<ResponseSemesterDto>> UpdateSemester(int SemesterId, [FromBody] RequestSemesterDto SemesterDto)
        {
            var updatedSemester = await _SemesterService.UpdateSemesterAsync(SemesterId, SemesterDto);
            if (updatedSemester == null) return NotFound();
            return Ok(updatedSemester);
        }

        [HttpDelete("{SemesterId}")]
        public async Task<ActionResult> DeleteSemester(int SemesterId)
        {
            var result = await _SemesterService.DeleteSemesterAsync(SemesterId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
