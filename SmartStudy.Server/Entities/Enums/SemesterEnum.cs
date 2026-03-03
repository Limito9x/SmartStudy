using SmartStudy.Server.Helpers;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(TermTypeNumberConverter))]
    public enum TermType
    {
        First = 1,
        Second = 2,
        Third = 3
    }
}
