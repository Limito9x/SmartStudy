using SmartStudy.Server.Entities;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Helpers;

public static class RoutineHelper
{
    public static IEnumerable<Occurence> GetOccurences(DateTime startAnchor, DateTime endAnchor, Routine routine, int? maxCount = 1000)
    {
        var count = 0;
        var schedules = routine.Schedules;
        for (var date = startAnchor; date <= endAnchor; date = date.AddDays(1))
        {
            foreach (var schedule in schedules)
            {
                if (count >= maxCount) yield break;
                if (date.DayOfWeek==schedule.DayOfWeek)
                {
                    yield return new Occurence(date, schedule);
                    count++;
                }
            }
        }
    }
}