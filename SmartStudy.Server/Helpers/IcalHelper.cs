using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Helpers
{
    public static class IcalHelper
    {
        /// <summary>
        /// Chuyển RecurrenceRule sang RecurrencePattern của iCal
        /// </summary>
        public static RecurrencePattern ToRecurrencePattern(Schedule myRule, DateTime endDate)
        {
            if (myRule == null)
                throw new ArgumentNullException(nameof(myRule));

            var pattern = new RecurrencePattern
            {
                Frequency = myRule.Frequency switch
                {
                    Frequency.Daily => FrequencyType.Daily,
                    Frequency.Weekly => FrequencyType.Weekly,
                    Frequency.Monthly => FrequencyType.Monthly,
                    Frequency.Yearly => FrequencyType.Yearly,
                    _ => throw new ArgumentOutOfRangeException(nameof(myRule.Frequency))
                },
                Interval = myRule.Interval > 0 ? myRule.Interval : 1
            };

            // Weekly: Map DaysOfWeek
            if (myRule.DaysOfWeek != null && myRule.DaysOfWeek.Any())
            {
                pattern.ByDay = myRule.DaysOfWeek
                    .Select(d => new Ical.Net.DataTypes.WeekDay((DayOfWeek)d))
                    .ToList();
            }

            // Monthly: Map DaysOfMonth
            if (myRule.DaysOfMonth != null && myRule.DaysOfMonth.Any())
            {
                pattern.ByMonthDay = myRule.DaysOfMonth.ToList();
            }

            // End Condition: Until (EndDate)
            pattern.Until = new CalDateTime(endDate);

            return pattern;
        }

        /// <summary>
        /// Lấy tất cả occurrences trong khoảng thời gian
        /// SAFE: Luôn có giới hạn để tránh unbounded enumeration
        /// </summary>
        public static List<DateTime> GetOccurrences(
            DateTime startAnchor, 
            DateTime endAnchor, 
            Schedule rule,
            int maxResults = 1000)
        {
            if (rule == null)
                return new List<DateTime>();

            try
            {
                var pattern = ToRecurrencePattern(rule, endAnchor);
                
                var searchEnd = endAnchor;
                
                // Tạo Calendar và Event
                var calendar = new Calendar();
                var vEvent = new CalendarEvent
                {
                    Start = new CalDateTime(startAnchor),
                    RecurrenceRules = new List<RecurrencePattern> { pattern }
                };
                calendar.Events.Add(vEvent);

                // ✅ FIX: Enumerate pattern với TakeWhile để tránh unbounded
                var results = new List<DateTime>();
                var current = startAnchor;
                var count = 0;

                // Dùng GetOccurrences với startDate only
                var occurrences = calendar.GetOccurrences(new CalDateTime(startAnchor));

                foreach (var occurrence in occurrences)
                {
                    var occDate = occurrence.Period.StartTime.AsUtc;
                    
                    // ✅ Stop conditions
                    if (occDate > searchEnd) break;
                    if (count >= maxResults) break;
                    
                    results.Add(occDate);
                    count++;
                }

                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IcalHelper] Error getting occurrences: {ex.Message}");
                Console.WriteLine($"[IcalHelper] Stack trace: {ex.StackTrace}");
                return new List<DateTime>();
            }
        }

        /// <summary>
        /// Lấy occurrence tiếp theo SAU một thời điểm cụ thể
        /// </summary>
        public static DateTime? GetNextOccurrence(
            DateTime afterDate,
            DateTime startDate,
            DateTime endDate,
            Schedule rule)
        {
            if (rule == null)
                return null;

            try
            {
                
                // Lấy occurrences, giới hạn 100 để tìm cái tiếp theo
                var occurrences = GetOccurrences(startDate, endDate, rule, maxResults: 100);

                // Tìm occurrence đầu tiên SAU afterDate
                return occurrences.FirstOrDefault(o => o > afterDate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IcalHelper] Error getting next occurrence: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Đếm số occurrences trong khoảng thời gian
        /// </summary>
        public static int CountOccurrences(
            DateTime startAnchor,
            DateTime endDate,
            Schedule rule)
        {
            if (rule == null)
                return 0;

            try
            {
                // Lấy tất cả occurrences trong range, giới hạn 10000
                var occurrences = GetOccurrences(startAnchor, endDate, rule, maxResults: 10000);
                return occurrences.Count;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IcalHelper] Error counting occurrences: {ex.Message}");
                return 0;
            }
        }
    }
}
