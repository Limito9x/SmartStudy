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
        
        [HttpGet("{courseId}/workload", Name = "GetCourseWorkload")]
        public async Task<ActionResult<CourseWorkloadDto>> GetCourseWorkload(int courseId,
            [FromQuery]string? search)
        {
            var workload = await _CourseService.GetCourseWorkloadAsync(courseId, search);
            return Ok(workload);
        }
        
        [HttpGet("{courseId}/events", Name = "GetCourseEvents")]
        public async Task<ActionResult<List<CourseEventDto>>> GetCourseEvents(int courseId)
        {
            var events = await _CourseService.GetCourseEventsAsync(courseId);
            return Ok(events);
        }

        [HttpPost(Name = "CreateCourse")]
        public async Task<ActionResult<ResponseCourseDto>> CreateCourse(RequestCourseDto CourseDto)
        {
            ResponseCourseDto createdCourse = await _CourseService.CreateCourseAsync(CourseDto);
            return CreatedAtAction(nameof(GetCourseWorkload), new { courseId = createdCourse.Id }, createdCourse);
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

        [HttpPatch("{courseId:int}/target-score", Name = "UpdateCourseTargetScore")]
        public async Task<ActionResult> UpdateCourseTargetScore(int courseId, [FromBody] double targetScore)
        {
            await _CourseService.UpdateCourseTargetScoreAsync(courseId, targetScore);
            return NoContent();
        }

        [HttpPost("{courseId:int}/final-score", Name = "UpdateCourseFinalScore")]
        public async Task<ActionResult> UpdateCourseFinalScore(int courseId, [FromBody] double finalScore)
        {
            await _CourseService.UpdateCourseFinalScoreAsync(courseId, finalScore);
            return NoContent();
        }

        [HttpPost("{courseId:int}/goal", Name = "UpdateCourseGoal")]
        public async Task<ActionResult> UpdateCourseGoal(int courseId, [FromBody] string goal)
        {
            await _CourseService.UpdateCourseGoalAsync(courseId, goal);
            return NoContent();
        }
    }
}
