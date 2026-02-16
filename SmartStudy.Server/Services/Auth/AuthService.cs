using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace SmartStudy.Server.Services.Auth
{
    public interface IAuthService
    {
        // Đăng ký người dùng mới
        Task<UserResponseDto> RegisterAsync(UserRegisterDto model);

        // Đăng nhập người dùng
        Task<LoginResponseDto> LoginAsync(UserLoginDto model);

        // Lấy thông tin người dùng từ token JWT (nếu cần) --> check token
        Task<UserResponseDto> GetUserProfileAsync(string userId);
    }
    public class AuthService: IAuthService
    {
        // Sử dụng công cụ UserManager và SignInManager của ASP.NET Core Identity để quản lý người dùng và xác thực
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager; 
        private readonly IConfiguration _configuration; // Đọc appsettings.json --> để lấy cấu hình JWT

        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration = null)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        // Phương thức đăng ký người dùng mới
        public async Task<UserResponseDto> RegisterAsync (UserRegisterDto model)
        {
            // 1. Kiểm tra xem người dùng đã tồn tại chưa
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            // 2. Tạo người dùng mới
            var newUser = new User
            {
                Email = model.Email,
                UserName = model.UserName ?? model.Email,
                FullName = model.FullName
            };

            // 3. Lưu người dùng vào cơ sở dữ liệu với mật khẩu đã mã hóa
            var result = await _userManager.CreateAsync(newUser, model.Password);
            if (result.Succeeded)
            {
                // 4. Trả về Response DTO nếu thành công
                return new UserResponseDto
                {                 
                    Email = newUser.Email,
                    UserName = newUser.UserName,
                    FullName = newUser.FullName,
                };
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ApplicationException($"An error occurred when registering: {errors}");
            }
        }

        public async Task<LoginResponseDto> LoginAsync(UserLoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null)
            {
                throw new Exception("Invalid username or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
            {
                throw new Exception("Invalid username or password");
            }

            // Tạo Access Token (JWT), vì Refresh Token tương đối phức tạp nên sẽ triển khai sau
            var tokenString = GenerateJwtToken(user);
            return new LoginResponseDto
            {
                Email = user.Email,
                UserName = user.UserName,
                FullName = user.FullName,
                Token = tokenString
            };

        }

        // Hàm tiện ích để tạo JWT, đặt là private vì chỉ sử dụng bên trong AuthService
        private string GenerateJwtToken(User user)
        {
            // A. Tạo danh sách các claim muốn chứa trong token
            // Claim tương đương như Payload trong JWT
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("fullName", user.FullName)
            };

            // B. Lấy key từ cấu hình và mã hóa
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecurityKey"]??"CustomSecretKey"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Credentials để ký token

            // C. Tạo object token
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            // D. Trả về chuỗi token đã được mã hóa
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<UserResponseDto> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            return new UserResponseDto
            {
                Email = user.Email,
                UserName = user.UserName,
                FullName = user.FullName,
            };
        }
    }
}
