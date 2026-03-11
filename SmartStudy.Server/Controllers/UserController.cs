using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPatch("setting/student-info")]
        public async Task<ActionResult> SettingStudentInfo([FromBody] StudentInfoDto settingDto)
        {
            await _userService.SettingStudentInfo(settingDto);
            return Ok();
        }
    }
}
