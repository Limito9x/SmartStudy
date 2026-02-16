using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.AI;
using SmartStudy.Server.Services.Semester;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/Semesters")]
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
            try
            {
                var createdSemester = await _SemesterService.CreateSemesterAsync(SemesterDto);
                return Ok(createdSemester);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseSemesterDto>>> GetSemesters()
        {
            try
            {
                var Semesters = await _SemesterService.GetSemestersByUserIdAsync();
                return Ok(Semesters);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{SemesterId}")]
        public async Task<ActionResult<ResponseSemesterDto>> GetSemesterById(int SemesterId)
        {
            try
            {
                var Semester = await _SemesterService.GetSemesterByIdAsync(SemesterId);
                if (Semester == null)
                {
                    return NotFound();
                }
                return Ok(Semester);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{SemesterId}")]
        public async Task<ActionResult<ResponseSemesterDto>> UpdateSemester(int SemesterId, [FromBody] RequestSemesterDto SemesterDto)
        {
            try
            {
                var updatedSemester = await _SemesterService.UpdateSemesterAsync(SemesterId, SemesterDto);
                return Ok(updatedSemester);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{SemesterId}")]
        public async Task<ActionResult> DeleteSemester(int SemesterId)
        {
            try
            {
                var result = await _SemesterService.DeleteSemesterAsync(SemesterId);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
