using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Auth;
using System.Security.Claims;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController: ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserRegisterDto model)
        {
            var userResponse = await _authService.RegisterAsync(model);
            return Created("User registered successfully", userResponse);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] UserLoginDto model)
        {
            var result = await _authService.LoginAsync(model);
            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(String.IsNullOrEmpty(userId))
            {
                return Unauthorized("User Id should not be empty");
            }
            var result = await _authService.GetUserProfileAsync(userId);

            if(result == null)
            {
                return NotFound("User not found");
            }

            return Ok(result);
        }
    }
}
