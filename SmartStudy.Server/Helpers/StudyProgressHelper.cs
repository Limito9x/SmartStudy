using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Helpers;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;
public static class StudyProgressHelper
{
    public static CourseProgressDto CalculateCourseProgress(Course course)
    {
        if (course == null) return new CourseProgressDto();

        // 1. Thực tế: Những gì đã CHỐT (Completed)
        var totalCompletions = course.Tasks?.Count(t => t.Status == TaskStatus.Completed) ?? 0;

        // 2. Những gì ĐANG NỢ (Task lẻ)
        int pendingSingleExpectations = course.Tasks?
            .Count(t => t.RoutineId == null && (t.Status == TaskStatus.Pending || t.Status == TaskStatus.InProgress)) ?? 0;

        // 3. Những gì ĐANG NỢ (Routine định mức)
        int totalRoutineExpectations = 0;
        foreach (var routine in course.Routines ?? [])
        {
            if (routine.IsActive)
            {
                var endAnchor = routine.EndDate ?? DateTime.UtcNow.AddHours(7);
                var occurrences = RoutineHelper.GetOccurences(routine.StartDate, endAnchor, routine);
                
                int routineOccurrencesCount = occurrences.Count();
                int routineCompletions = course.Tasks?.Count(t => t.RoutineId == routine.Id && t.Status == TaskStatus.Completed) ?? 0;
                
                // Định mức nợ = Tổng suất - Những suất đã xong
                int remainingRoutineExpectations = Math.Max(0, routineOccurrencesCount - routineCompletions);
                totalRoutineExpectations += remainingRoutineExpectations;
            }
        }

        // TỔNG MẪU SỐ = Đã xong + Đang nợ lẻ + Đang nợ Routine
        int totalExpectations = totalCompletions + pendingSingleExpectations + totalRoutineExpectations;

        double progress = totalExpectations > 0 ? (double)totalCompletions / totalExpectations : 0;

        return new CourseProgressDto
        {
            Progress = Math.Round(progress * 100, 1),
            TotalExpectations = totalExpectations,
            TotalCompletions = totalCompletions
        };
    }
}