using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum SubjectType
    {
        Theory,
        Practice,
        Project,
        Thesis,
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum CourseStatus
    {
        Draft, // Kế hoạch học tập mới tạo, chưa bắt đầu
        Enrolled, // Đã đăng ký học phần, đang học
        Completed,
        Dropped
    }
}
