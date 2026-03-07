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
}
