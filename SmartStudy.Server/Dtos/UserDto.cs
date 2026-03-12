using System.ComponentModel.DataAnnotations;

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
        // Thông tin cần thiết để tính toán kế hoạch học tập
        DateTime AdmissionDate,
        int SemestersPerYear, // 2 hoặc 3, tùy theo hệ thống giáo dục
        int WeeksPerSemester,
        int? WeeksOfSummerSemester, // Tuần của học kỳ phụ/hè, nếu có
        float ProgramLength,
    // Thông tin để hiển thị trong profile, có thể bổ sung sau
        string? University,
        string? Major,
        string? Cohort,
        int? TotalRequiredCredits,
        int? CreditsPerSemester,
        int? CreditsPerSummerSemester
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
    }

    public class LoginResponseDto
    {
        public string Email { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public required string Token { get; set; }
        public bool HasCompletedOnboarding  { get; set; }
    }
}
