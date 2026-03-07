using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/subjects")]
    [Authorize]
    public class SubjectController: ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        [HttpGet(Name = "GetSubjects")]
        public async Task<IActionResult> GetSubjects()
        {
            var subjects = await _subjectService.GetAllSubjectsAsync();
            return Ok(subjects);
        }

        [HttpPost(Name = "CreateSubject")]
        public async Task<IActionResult> CreateSubject(RequestSubjectDto subjectDto)
        {
            var createdSubject = await _subjectService.CreateSubjectAsync(subjectDto);
            return Ok(createdSubject);
        }

        [HttpPost("bulk", Name = "BulkCreateSubjects")]
        public async Task<IActionResult> BulkCreateSubjects(List<RequestSubjectDto> subjectDtos)
        {
            var createdSubjects = await _subjectService.BulkCreateSubjectsAsync(subjectDtos);
            return Ok(createdSubjects);
        }

        [HttpPut("{subjectId:int}", Name = "UpdateSubject")]
        public async Task<IActionResult> UpdateSubject(int subjectId, RequestSubjectDto subjectDto)
        {
            var updatedSubject = await _subjectService.UpdateSubjectAsync(subjectId, subjectDto);
            if (updatedSubject == null) return NotFound();
            return Ok(updatedSubject);
        }

        [HttpDelete("{subjectId:int}", Name = "DeleteSubject")]
        public async Task<IActionResult> DeleteSubject(int subjectId)
        {
            var result = await _subjectService.DeleteSubjectAsync(subjectId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
