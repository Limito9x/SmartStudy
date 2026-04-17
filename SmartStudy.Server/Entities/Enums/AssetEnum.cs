using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AssetLinkType
    {
        StudyPlan,
        Course,
        Task,
        Log,
        ExternalLink
    }

    public enum AssetLinkCategory
    {
        Reference,
        Result
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AssetStatus
    {
        Uploaded, // Mới được upload lên, chưa được xử lý
        Processing, // Đang được xử lý (ví dụ: đang được parse, đang được tạo embedding)
        Analyzed, // Đã được xử lý xong, đã sẵn sàng cho RAG
        Failed // Có lỗi xảy ra trong quá trình xử lý (ví dụ: lỗi parse, lỗi embedding)
    }
}
