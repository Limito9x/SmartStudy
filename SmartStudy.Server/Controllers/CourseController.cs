using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

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

        [HttpGet(Name = "GetCourses")]
        public async Task<ActionResult<List<ResponseCourseDto>>> GetCoursesByStudyPlan(
            [FromQuery] int? studyPlanId)
        {
            List<ResponseCourseDto> courses = await _CourseService.GetCoursesAsync(studyPlanId);
            return Ok(courses);
        }

        [HttpGet("{courseId}", Name = "GetCourseById")]
        public async Task<ActionResult<ResponseCourseDto>> GetCourseById(int courseId)
        {
            ResponseCourseDto? course = await _CourseService.GetCourseByIdAsync(courseId);
            if (course == null) return NotFound();
            return Ok(course);
        }

        [HttpPost(Name = "CreateCourse")]
        public async Task<ActionResult<ResponseCourseDto>> CreateCourse(RequestCourseDto CourseDto)
        {
            ResponseCourseDto createdCourse = await _CourseService.CreateCourseAsync(CourseDto);
            return CreatedAtAction(nameof(GetCourseById), new { courseId = createdCourse.Id }, createdCourse);
        }

        [HttpPatch("{courseId}", Name = "UpdateCourse")]
        public async Task<ActionResult<ResponseCourseDto>> UpdateCourse(int courseId, RequestCourseDto CourseDto)
        {
            ResponseCourseDto? updatedCourse = await _CourseService.UpdateCourseAsync(courseId, CourseDto);
            if (updatedCourse == null) return NotFound();
            return Ok(updatedCourse);
        }

        [HttpDelete("{courseId}", Name = "DeleteCourse")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            var deleted = await _CourseService.DeleteCourseAsync(courseId);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPatch("{courseId:int}/status", Name = "UpdateCourseStatus")]
        public async Task<ActionResult> UpdateCourseStatus(int courseId, [FromBody] UpdateCourseStatusDto dto)
        {
            await _CourseService.UpdateCourseStatusAsync(courseId, dto);
            return NoContent();
        }
    }
}
