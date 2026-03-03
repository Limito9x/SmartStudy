using SmartStudy.Server.Entities.Enums;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Helpers
{
    public class TermTypeNumberConverter : JsonConverter<TermType>
    {
        public override TermType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return (TermType)reader.GetInt32();
        }

        public override void Write(Utf8JsonWriter writer, TermType value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue((int)value);
        }
    }
}
