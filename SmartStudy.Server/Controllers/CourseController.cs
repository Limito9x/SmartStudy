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

        [HttpGet("{CourseId}")]
        public async Task<ActionResult<ResponseCourseDto>> GetCourseById(int CourseId)
        {
            var Course = await _CourseService.GetCourseByIdAsync(CourseId);
            if (Course == null) return NotFound();
            return Ok(Course);
        }

        [HttpPost]
        public async Task<ActionResult<ResponseCourseDto>> CreateCourse(RequestCourseDto CourseDto)
        {
            var createdCourse = await _CourseService.CreateCourseAsync(CourseDto);
            return CreatedAtAction(nameof(GetCourseById), new { CourseId = createdCourse.Id }, createdCourse);
        }

        [HttpPatch("{CourseId}")]
        public async Task<ActionResult<ResponseCourseDto>> UpdateCourse(int CourseId, RequestCourseDto CourseDto)
        {
            var updatedCourse = await _CourseService.UpdateCourseAsync(CourseId, CourseDto);
            if (updatedCourse == null) return NotFound();
            return Ok(updatedCourse);
        }

        [HttpDelete("{CourseId}")]
        public async Task<IActionResult> DeleteCourse(int CourseId)
        {
            var deleted = await _CourseService.DeleteCourseAsync(CourseId);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
