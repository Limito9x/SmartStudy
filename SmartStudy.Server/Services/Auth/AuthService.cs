using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using SmartStudy.Server.Exceptions;

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
                throw new AppException("Email này đã được đăng ký!");
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
                if(result.Errors.Any(e => e.Code == "PasswordTooShort"))
                {
                    throw new AppException("Mật khẩu phải có ít nhất 6 ký tự!");
                }
                if(result.Errors.Any(e => e.Code == "PasswordRequiresNonAlphanumeric"))
                {
                    throw new AppException("Mật khẩu phải chứa ít nhất một ký tự đặc biệt!");
                }
                if(result.Errors.Any(e => e.Code == "PasswordRequiresDigit"))
                {
                    throw new AppException("Mật khẩu phải chứa ít nhất một chữ số!");
                }
                if(result.Errors.Any(e => e.Code == "PasswordRequiresUpper"))
                {
                    throw new AppException("Mật khẩu phải chứa ít nhất một chữ cái viết hoa!");
                }
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ApplicationException($"An error occurred when registering: {errors}");
            }
        }

        public async Task<LoginResponseDto> LoginAsync(UserLoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null)
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu không chính xác");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
            {
                throw new AppException("Mật khẩu không trùng khớp, vui lòng thử lại!");
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
