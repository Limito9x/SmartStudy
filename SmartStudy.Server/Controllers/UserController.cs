using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.UserSerivice;

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
        [HttpPost("setting")]
        public async Task<ActionResult> SettingUserContext([FromBody] UserSettingDto settingDto)
        {
            await _userService.SettingUserContext(settingDto);
            return Ok();
        }
    }
}
