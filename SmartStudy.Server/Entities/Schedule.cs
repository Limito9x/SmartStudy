using Ical.Net.DataTypes;

namespace SmartStudy.Server.Entities
{
    public enum Frequency
    {
        Daily,
        Weekly,
        Monthly,
        Yearly
    }

    public enum TimeUnit
    {
        Minutes,
        Hours,
        Periods
    }

    public enum WeekDay
    {
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6,
        Sunday = 7
    }

    public class Schedule: BaseEntity
    {
        public Frequency Frequency { get; set; }
        public int Interval { get; set; } = 1;
        public WeekDay[]? DaysOfWeek { get; set; }
        public int[]? DaysOfMonth { get; set; }
        public TimeOnly StartTime { get; set; }
        public int Duration { get; set; }
        public TimeUnit DurationUnit { get; set; }
        public string? Location { get; set; }
        public int? RoutineId { get; set; }
        public Routine? Routine { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
    }
}
