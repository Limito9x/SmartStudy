using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TaskType
    {
        ClassSession,  // Buổi học trên trường (Sinh ra từ Routine cố định, cấm xóa bậy)
        SelfStudy,     // Buổi tự học (User tự tạo hoặc AI gợi ý ôn thi)
        AssignmentWork,// Buổi ngồi cày bài tập (Khác với ngày NỘP bài bên TimelineEvent)
        Meeting // Họp 
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TaskStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled,
    }
}
