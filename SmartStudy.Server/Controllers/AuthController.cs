using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;
using System.Security.Claims;

namespace SmartStudy.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController: ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register",Name ="Register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserRegisterDto model)
        {
            var userResponse = await _authService.RegisterAsync(model);
            return Created("User registered successfully", userResponse);
        }

        [HttpPost("login",Name="Login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] UserLoginDto model)
        {
            var result = await _authService.LoginAsync(model);
            return Ok(result);
        }

        [HttpGet("me",Name ="GetProfile")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(String.IsNullOrEmpty(userId))
            {
                return Unauthorized("User Id should not be empty");
            }
            if (!int.TryParse(userId, out var userIdInt))
            {
                return Unauthorized("Invalid user ID format");
            }
            var result = await _authService.GetUserProfileAsync(userIdInt);

            if(result == null)
            {
                return NotFound("User not found");
            }

            return Ok(result);
        }
    }
}
