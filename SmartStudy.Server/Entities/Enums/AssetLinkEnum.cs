using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AssetLinkType
    {
        StudyPlan,
        Course,
        Task,
        Log
    }

    public enum AssetLinkCategory
    {
        Reference,
        Result
    }
}
