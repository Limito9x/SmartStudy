using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services;

public interface IInternalService
{
    Task<List<int>?> GetAllowedAssetsAsync(int userId, int? courseId);
    Task<InternalStudyPlanProgressDto?> GetActiveStudyPlanProgressAsync(int userId);
    Task<InternalCourseProgressDto?> GetCourseProgressAsync(int userId, int courseId, bool includeInactive = false);
    Task<InternalLearningCalendarContextDto?> GetLearningCalendarContextAsync(int userId, int? courseId, int horizonDays = 14);
    Task<InternalPhasePreviewDto?> SuggestPhasePreviewAsync(InternalPhasePreviewRequestDto request);
}

public class InternalService: IInternalService
{
    private readonly ApplicationDbContext _context;
    private readonly ICalendarService _calendarService;
    
    public InternalService(ApplicationDbContext context, ICalendarService calendarService)
    {
        _context = context;
        _calendarService = calendarService;
    }
    
    public async Task<List<int>?> GetAllowedAssetsAsync(int userId, int? courseId)
    {
        var tasksQuery = _context.Tasks
            .Where(t => t.UserId == userId);

        if (courseId.HasValue)
        {
            tasksQuery = tasksQuery.Where(t => t.Phase != null && t.Phase.CourseId == courseId.Value);
        }

        var taskIds = await tasksQuery
            .Select(t => t.Id)
            .ToListAsync();
        
        var logIds = await _context.Logs
            .Where(l => taskIds.Contains(l.TaskId))
            .Select(l => l.Id).ToListAsync();

        // 2. Lấy danh sách AssetId của khóa học
        var allRelatedAssetIds = await _context.AssetLinks
            .Where(al =>
                (al.LinkedType == AssetLinkType.Course && al.LinkedId == courseId) ||
                (al.LinkedType == AssetLinkType.Task && taskIds.Contains(al.LinkedId)) ||
                (al.LinkedType == AssetLinkType.Log && logIds.Contains(al.LinkedId)))
            .Select(al => al.AssetId)
            .Distinct()
            .ToListAsync();

        return allRelatedAssetIds;
    }

    public async Task<InternalStudyPlanProgressDto?> GetActiveStudyPlanProgressAsync(int userId)
    {
        var activePlan = await _context.StudyPlans
            .AsNoTracking()
            .Include(p => p.Courses!)
                .ThenInclude(c => c.Phases)
                    .ThenInclude(ph => ph.Tasks)
            .Include(p => p.Courses!)
                .ThenInclude(c => c.Phases)
                    .ThenInclude(ph => ph.Routines)
                        .ThenInclude(r => r.Schedules)
            .Where(p => p.UserId == userId && p.Status == StudyPlanStatus.Active)
            .OrderByDescending(p => p.StartDate)
            .FirstOrDefaultAsync();

        if (activePlan == null)
        {
            return null;
        }

        var totalExpectations = 0;
        var totalCompletions = 0;

        foreach (var course in activePlan.Courses ?? [])
        {
            var courseProgress = StudyProgressHelper.CalculateCourseProgress(course);
            totalExpectations += courseProgress.TotalExpectations;
            totalCompletions += courseProgress.TotalCompletions;
        }

        var progress = totalExpectations > 0
            ? Math.Round((double)totalCompletions / totalExpectations * 100.0, 2)
            : 0;

        return new InternalStudyPlanProgressDto
        {
            StudyPlanId = activePlan.Id,
            StudyPlanName = activePlan.Name,
            StartDate = activePlan.StartDate,
            EndDate = activePlan.EndDate,
            ActiveCourseCount = (activePlan.Courses ?? []).Count(c => c.Status == CourseStatus.Enrolled),
            TotalExpectations = totalExpectations,
            TotalCompletions = totalCompletions,
            Progress = progress
        };
    }

    public async Task<InternalCourseProgressDto?> GetCourseProgressAsync(int userId, int courseId, bool includeInactive = false)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.StudyPlan)
            .Include(c => c.Phases)
                .ThenInclude(p => p.Tasks)
            .Include(c => c.Phases)
                .ThenInclude(p => p.Routines)
                    .ThenInclude(r => r.Schedules)
            .FirstOrDefaultAsync(c => c.Id == courseId && c.StudyPlan != null && c.StudyPlan.UserId == userId);

        if (course == null || course.StudyPlan == null)
        {
            return null;
        }

        if (!includeInactive)
        {
            var isActiveScope = course.StudyPlan.Status == StudyPlanStatus.Active && course.Status == CourseStatus.Enrolled;
            if (!isActiveScope)
            {
                return null;
            }
        }

        var courseProgress = StudyProgressHelper.CalculateCourseProgress(course);

        var totalLoggedDuration = await _context.Logs
            .Where(l => l.Task.Phase != null && l.Task.Phase.CourseId == courseId)
            .SumAsync(l => (double?)l.ActualDuration ?? 0);

        return new InternalCourseProgressDto
        {
            CourseId = course.Id,
            CourseName = course.Name,
            CourseStatus = course.Status,
            StudyPlanId = course.StudyPlanId,
            StudyPlanStatus = course.StudyPlan.Status,
            TotalExpectations = courseProgress.TotalExpectations,
            TotalCompletions = courseProgress.TotalCompletions,
            Progress = courseProgress.Progress,
            TotalLoggedDuration = Math.Round(totalLoggedDuration, 2)
        };
    }

    public async Task<InternalLearningCalendarContextDto?> GetLearningCalendarContextAsync(int userId, int? courseId, int horizonDays = 14)
    {
        horizonDays = Math.Clamp(horizonDays, 1, 30);

        if (courseId.HasValue)
        {
            var hasAccess = await _context.Courses
                .AsNoTracking()
                .AnyAsync(c => c.Id == courseId.Value
                               && c.StudyPlan != null
                               && c.StudyPlan.UserId == userId);

            if (!hasAccess)
            {
                return null;
            }
        }

        var localToday = DateTime.UtcNow.AddHours(7).Date;
        var fromDate = DateOnly.FromDateTime(localToday);
        var toDate = fromDate.AddDays(horizonDays);

        var events = await _calendarService.GetCalendarAsync(userId, fromDate, toDate);

        if (courseId.HasValue)
        {
            events = events
                .Where(e => e.CourseId == courseId.Value)
                .ToList();
        }

        var orderedEvents = events
            .OrderBy(e => e.StartAt)
            .Take(100)
            .ToList();

        return new InternalLearningCalendarContextDto
        {
            UserId = userId,
            CourseId = courseId,
            HorizonDays = horizonDays,
            FromDate = fromDate,
            ToDate = toDate,
            Events = orderedEvents
        };
    }

    public async Task<InternalPhasePreviewDto?> SuggestPhasePreviewAsync(InternalPhasePreviewRequestDto request)
    {
        var horizonDays = Math.Clamp(request.HorizonDays, 7, 30);

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == request.CourseId
                        && c.StudyPlan != null
                        && c.StudyPlan.UserId == request.UserId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Goal
            })
            .FirstOrDefaultAsync();

        if (course == null)
        {
            return null;
        }

        var calendarContext = await GetLearningCalendarContextAsync(request.UserId, request.CourseId, horizonDays);
        if (calendarContext == null)
        {
            return null;
        }

        var progress = await GetCourseProgressAsync(request.UserId, request.CourseId, includeInactive: true);

        var pendingCount = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == request.UserId
                        && t.Phase != null
                        && t.Phase.CourseId == request.CourseId
                        && t.Status != SmartStudy.Server.Entities.Enums.TaskStatus.Completed
                        && t.Status != SmartStudy.Server.Entities.Enums.TaskStatus.Cancelled
                        && t.Status != SmartStudy.Server.Entities.Enums.TaskStatus.Archived)
            .CountAsync();

        var windows = BuildSuggestedWindows(calendarContext.Events, calendarContext.FromDate, calendarContext.ToDate);

        var fallbackStart = DateTime.UtcNow.AddHours(7).Date.AddDays(1).AddHours(19);
        var phaseStart = windows.FirstOrDefault()?.StartAt ?? fallbackStart;
        var phaseEnd = phaseStart.AddDays(Math.Clamp(horizonDays / 2, 5, 14));

        var goal = string.IsNullOrWhiteSpace(request.LearningGoal)
            ? (string.IsNullOrWhiteSpace(course.Goal)
                ? $"Cai thien tien do mon {course.Name}"
                : course.Goal!)
            : request.LearningGoal.Trim();

        var progressPercent = progress?.Progress ?? 0;
        var rationale =
            $"De xuat dua tren lich hoc {horizonDays} ngay toi, tien do hien tai {progressPercent}% va {pendingCount} task dang chua hoan thanh.";

        var firstTaskStart = windows.FirstOrDefault()?.StartAt ?? phaseStart;
        var secondTaskStart = windows.Skip(1).FirstOrDefault()?.StartAt ?? phaseStart.AddDays(2);
        var thirdTaskStart = phaseEnd.AddHours(-2);

        var tasks = new List<InternalPhasePreviewTaskDto>
        {
            new()
            {
                Name = "Tong hop lo hong kien thuc",
                Type = TaskType.AssignmentWork,
                StartDateTime = firstTaskStart,
                EndDateTime = firstTaskStart.AddHours(2),
                Description = $"Ra soat lai cac noi dung can tap trung cho muc tieu: {goal}"
            },
            new()
            {
                Name = "Luyen tap co gioi han thoi gian",
                Type = TaskType.SelfStudy,
                StartDateTime = secondTaskStart,
                EndDateTime = secondTaskStart.AddHours(2),
                Description = "Uu tien cac chu de weak spot va cau hoi de nham lan."
            },
            new()
            {
                Name = "Tong ket phase va danh gia ket qua",
                Type = TaskType.Milestone,
                StartDateTime = thirdTaskStart,
                EndDateTime = phaseEnd,
                Description = "So sanh ket qua thuc te voi muc tieu phase."
            }
        };

        return new InternalPhasePreviewDto
        {
            UserId = request.UserId,
            CourseId = request.CourseId,
            Source = "calendar_progress_graph",
            Phase = new InternalPhasePreviewPhaseDto
            {
                Title = $"Phase de xuat: {course.Name}",
                Type = PhaseType.ExamPrep,
                Priority = PriorityLevel.High,
                StartDateTime = phaseStart,
                EndDateTime = phaseEnd,
                Notes = $"Goal: {goal}",
                Rationale = rationale
            },
            SuggestedTasks = tasks,
            SuggestedStudyWindows = windows.Take(6).ToList(),
            ContextSummary = $"Progress {progressPercent}% | Pending tasks {pendingCount} | Events {calendarContext.Events.Count}"
        };
    }

    private static List<InternalPhasePreviewWindowDto> BuildSuggestedWindows(
        List<CalendarEventDto> events,
        DateOnly fromDate,
        DateOnly toDate)
    {
        var normalizedEvents = events
            .Where(e => e.EndAt > e.StartAt)
            .OrderBy(e => e.StartAt)
            .ThenBy(e => e.EndAt)
            .ToList();

        var windows = new List<InternalPhasePreviewWindowDto>();

        for (var date = fromDate; date <= toDate; date = date.AddDays(1))
        {
            var dayStart = date.ToDateTime(new TimeOnly(7, 0));
            var dayEnd = date.ToDateTime(new TimeOnly(22, 0));
            var cursor = dayStart;

            var dayEvents = normalizedEvents
                .Where(e => e.StartAt.Date == dayStart.Date)
                .OrderBy(e => e.StartAt)
                .ToList();

            foreach (var evt in dayEvents)
            {
                if (evt.StartAt > cursor)
                {
                    var gap = evt.StartAt - cursor;
                    if (gap.TotalMinutes >= 75)
                    {
                        windows.Add(new InternalPhasePreviewWindowDto
                        {
                            StartAt = cursor,
                            EndAt = evt.StartAt,
                            Reason = "Khoang trong giua cac su kien"
                        });
                    }
                }

                if (evt.EndAt > cursor)
                {
                    cursor = evt.EndAt;
                }
            }

            if (dayEnd > cursor)
            {
                var tailGap = dayEnd - cursor;
                if (tailGap.TotalMinutes >= 75)
                {
                    windows.Add(new InternalPhasePreviewWindowDto
                    {
                        StartAt = cursor,
                        EndAt = dayEnd,
                        Reason = "Khoang trong cuoi ngay"
                    });
                }
            }
        }

        return windows.Take(12).ToList();
    }
}