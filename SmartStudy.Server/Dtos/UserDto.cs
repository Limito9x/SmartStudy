using System.ComponentModel.DataAnnotations;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Dtos
{
    // DTO cho việc đăng ký người dùng
    public class UserRegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string UserName { get; set; }
        [Required]
        public string FullName { get; set; }
    }

    public record StudentInfoDto(
    // Thông tin để hiển thị trong profile, có thể bổ sung sau
        string? University,
        string? Major,
        string? Cohort,
        int AdmissionYear,
        int TermId,
        int YearId,
        DateTime StartDate,
        DateTime EndDate
    );

    public record ResponseStudentInfoDto
    (
        string? University,
        string? Major,
        string? Cohort
    );

    // DTO cho việc đăng nhập người dùng
    public class UserLoginDto
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
    }

    // DTO cho việc trả về thông tin người dùng
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public ResponseStudentInfoDto StudentInfo { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class LoginResponseDto
    {
        public string Email { get; set; }
        public string Role { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public required string Token { get; set; }
        public bool HasCompletedOnboarding  { get; set; }
    }
}
