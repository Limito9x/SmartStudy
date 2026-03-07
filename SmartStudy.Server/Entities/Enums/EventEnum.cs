using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum RequirementStrategy
    {
        Additive, // Cộng dồn giá trị đóng góp
        Averaging, // Lấy trung bình giá trị đóng góp
        MaxValue, // Lấy giá trị đóng góp cao nhất
        TaskBased, // Đóng góp dựa trên số lượng task hoàn thành
    }
}
