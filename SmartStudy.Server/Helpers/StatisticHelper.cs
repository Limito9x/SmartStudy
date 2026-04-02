using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Helpers;

public static class StatisticHelper
{
    public static double CalculateProductivity(LogItem log, TaskItem? task)
    {
        if (task == null) return 0;

        var actualMinutes =
            log.TimerStartAt.HasValue && log.TimerEndAt.HasValue
                ? (log.TimerEndAt.Value - log.TimerStartAt.Value).TotalMinutes
                : log.ActualDuration;
        
        var plannedDuration = task.EndDateTime.HasValue && task.StartDateTime.HasValue
            ? (task.EndDateTime.Value - task.StartDateTime.Value).TotalMinutes
            : 0;

        var timeEfficiency = plannedDuration > 0
            ? Math.Min(actualMinutes / plannedDuration, 1.0)
            : 1.0;

        // Task không có comprehension → chỉ dựa vào thời gian
        var hasComprehension = task.Type is
            TaskType.ClassSession or
            TaskType.SelfStudy or
            TaskType.AssignmentWork;

        if (!hasComprehension)
            return Math.Round(timeEfficiency * 100, 1);

        var comprehensionWeight = log.ComprehensionLevel switch {
            ComprehensionLevel.Advanced     => 1.0,
            ComprehensionLevel.Intermediate => 0.8,
            ComprehensionLevel.Basic        => 0.5,
            ComprehensionLevel.None         => 0.2,
            null                            => 0.7
        };

        return Math.Round(timeEfficiency * comprehensionWeight * 100, 1);
    }
}