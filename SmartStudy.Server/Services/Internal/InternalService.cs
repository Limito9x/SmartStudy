using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services;

public interface IInternalService
{
    Task<List<int>?> GetAllowedAssetsAsync(int userId, int? courseId);
    Task<InternalStudyPlanProgressDto?> GetActiveStudyPlanProgressAsync(int userId);
    Task<InternalCourseProgressDto?> GetCourseProgressAsync(int userId, int courseId, bool includeInactive = false);
}

public class InternalService: IInternalService
{
    private readonly ApplicationDbContext _context;
    
    public InternalService(ApplicationDbContext context)
    {
        _context = context;
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
            .Include(p => p.Courses)
                .ThenInclude(c => c.Phases)
                    .ThenInclude(ph => ph.Tasks)
            .Include(p => p.Courses)
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

        foreach (var course in activePlan.Courses)
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
            ActiveCourseCount = activePlan.Courses.Count(c => c.Status == CourseStatus.Enrolled),
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
}