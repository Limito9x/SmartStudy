using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Course;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/courses")]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _CourseService;
        public CourseController(ICourseService CourseService)
        {
            _CourseService = CourseService;
        }

        [HttpGet("Semester/{SemesterId}",Name ="GetCoursesBySemester")]
        public async Task<ActionResult<List<SimpleResponseCourseDto>>> GetCoursesBySemester(int SemesterId)
        {
            List<SimpleResponseCourseDto> courses = await _CourseService.GetCoursesBySemesterIdAsync(SemesterId);
            return Ok(courses);
        }

        [HttpGet("{CourseId}",Name ="GetCourseById")]
        public async Task<ActionResult<ResponseCourseDto>> GetCourseById(int CourseId)
        {
            ResponseCourseDto? course = await _CourseService.GetCourseByIdAsync(CourseId);
            if (course == null) return NotFound();
            return Ok(course);
        }

        [HttpPost(Name ="CreateCourse")]
        public async Task<ActionResult<ResponseCourseDto>> CreateCourse(RequestCourseDto CourseDto)
        {
            ResponseCourseDto createdCourse = await _CourseService.CreateCourseAsync(CourseDto);
            return CreatedAtAction(nameof(GetCourseById), new { CourseId = createdCourse.Id }, createdCourse);
        }

        [HttpPatch("{CourseId}",Name ="UpdateCourse")]
        public async Task<ActionResult<ResponseCourseDto>> UpdateCourse(int CourseId, RequestCourseDto CourseDto)
        {
            ResponseCourseDto? updatedCourse = await _CourseService.UpdateCourseAsync(CourseId, CourseDto);
            if (updatedCourse == null) return NotFound();
            return Ok(updatedCourse);
        }

        [HttpDelete("{CourseId}",Name ="DeleteCourse")]
        public async Task<IActionResult> DeleteCourse(int CourseId)
        {
            var deleted = await _CourseService.DeleteCourseAsync(CourseId);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
