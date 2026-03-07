using Ical.Net.DataTypes;
using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum Frequency
    {
        Daily,
        Weekly,
        Monthly,
        Yearly
    }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TimeUnit
    {
        Minutes,
        Hours,
        Periods
    }

    public class Schedule: BaseEntity
    {
        public Frequency Frequency { get; set; }
        public int Interval { get; set; } = 1;
        public DayOfWeek DayOfWeek { get; set; } // Sửa lại thành một ngày trong tuần duy nhất để dễ tính và đồng nhất
        public int[]? DaysOfMonth { get; set; }
        public TimeOnly? StartTime { get; set; }
        public int? Duration { get; set; }
        public TimeUnit? DurationUnit { get; set; }
        public string? Location { get; set; }
        // Đơn giản hóa quan hệ
        // Một lịch chỉ thuộc về Routine
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public ICollection<TaskItem> Tasks { get; set; }
    }
}
