using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Exceptions;

namespace SmartStudy.Server.Services
{
    public interface IAuthService
    {
        // Đăng ký người dùng mới
        Task<UserResponseDto> RegisterAsync(UserRegisterDto model);

        // Đăng nhập người dùng
        Task<LoginResponseDto> LoginAsync(UserLoginDto model);

        // Lấy thông tin người dùng từ token JWT (nếu cần) --> check token
        Task<UserResponseDto> GetUserProfileAsync(int userId);
    }
    public class AuthService: IAuthService
    {
        // Sử dụng công cụ UserManager và SignInManager của ASP.NET Core Identity để quản lý người dùng và xác thực
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager; 
        private readonly IConfiguration _configuration; // Đọc appsettings.json --> để lấy cấu hình JWT
        private readonly string _secondSecretKey;

        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _secondSecretKey = "SecondCustomSecretThatIsVeryLongAndHas256Bits!@#";
        }

        // Phương thức đăng ký người dùng mới
        public async Task<UserResponseDto> RegisterAsync (UserRegisterDto model)
        {
            // 1. Kiểm tra xem người dùng đã tồn tại chưa
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                throw new AppException("Email này đã được đăng ký!");
            }

            // 2. Tạo người dùng mới
            var newUser = new User
            {
                Email = model.Email,
                UserName = model.UserName ?? model.Email,
                FullName = model.FullName,
                StudentInfo = new StudentInfo()
            };

            // 3. Lưu người dùng vào cơ sở dữ liệu với mật khẩu đã mã hóa
            var result = await _userManager.CreateAsync(newUser, model.Password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(newUser, "Student");
                // 4. Trả về Response DTO nếu thành công
                return new UserResponseDto
                {                 
                    Email = newUser.Email,
                    UserName = newUser.UserName,
                    FullName = newUser.FullName,
                };
            }
            var errors = string.Join("\n", result.Errors.Select(e => e.Description));
            throw new AppException($"Đăng ký thất bại:\n{errors}");
        }

        public async Task<LoginResponseDto> LoginAsync(UserLoginDto model)
        {
            var user = await _userManager.Users
                .Include(u => u.StudentInfo)
                .FirstOrDefaultAsync(u => u.UserName == model.UserName);
            if (user == null)
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu không chính xác!");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu không chính xác!");
            }

            // Tạo Access Token (JWT), vì Refresh Token tương đối phức tạp nên sẽ triển khai sau
            var tokenString = await GenerateJwtToken(user);
            var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Student";
            return new LoginResponseDto
            {
                Email = user.Email,
                Role = role,
                UserName = user.UserName,
                FullName = user.FullName,
                Token = tokenString,
                HasCompletedOnboarding = user.StudentInfo?.University != null // Giả sử onboarding hoàn thành khi đã có ngày nhập học
            };

        }

        // Hàm tiện ích để tạo JWT, đặt là private vì chỉ sử dụng bên trong AuthService
        private async Task<string> GenerateJwtToken(User user)
        {
            var roles = await _userManager.GetRolesAsync(user); // Lấy danh sách role của user, có thể dùng để thêm claim nếu cần
            // A. Tạo danh sách các claim muốn chứa trong token
            // Claim tương đương như Payload trong JWT
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // B. Lấy key từ cấu hình và mã hóa
            var keystring = _configuration?["JwtSettings:SecurityKey"] ?? _secondSecretKey;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keystring));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Credentials để ký token

            // C. Tạo object token
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            // D. Trả về chuỗi token đã được mã hóa
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<UserResponseDto> GetUserProfileAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
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
