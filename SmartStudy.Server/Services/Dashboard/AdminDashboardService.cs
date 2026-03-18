using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Exceptions;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services;

public interface IAdminDashboardService
{
    Task<KpiSummaryDto> GetKpiSummaryAsync();
    Task<List<UserGrowthChartDto>> GetUserGrowthChartAsync(int days = 30);
    Task<List<BehaviorChartDto>> GetBehaviorChartAsync();
    Task<PagedResult<UserAdminDto>> GetUsersForAdminAsync(int pageIndex, int pageSize);
    Task<bool> ToggleUserStatusAsync(int userId);
}

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private const string StudentRole = "STUDENT";

    public AdminDashboardService(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<KpiSummaryDto> GetKpiSummaryAsync()
    {
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

        var studentUserIdsQuery =
            from ur in _context.Set<IdentityUserRole<int>>().AsNoTracking()
            join r in _context.Roles.AsNoTracking() on ur.RoleId equals r.Id
            where r.NormalizedName == StudentRole
            select ur.UserId;

        var totalUsers = await studentUserIdsQuery.Distinct().CountAsync();

        var activeUsersThisWeek = await (
            from l in _context.Logs.AsNoTracking()
            join t in _context.Tasks.AsNoTracking() on l.TaskId equals t.Id
            where l.CreatedAt >= sevenDaysAgo
                  && studentUserIdsQuery.Contains(t.UserId)
            select t.UserId
        ).Distinct().CountAsync();

        var totalSystemHours = (await (
            from l in _context.Logs.AsNoTracking()
            join t in _context.Tasks.AsNoTracking() on l.TaskId equals t.Id
            where studentUserIdsQuery.Contains(t.UserId)
            select (double?)l.ActualDuration
        ).SumAsync() ?? 0d) / 60d;

        var totalCompletedTasks = await (
            from t in _context.Tasks.AsNoTracking()
            where studentUserIdsQuery.Contains(t.UserId)
                  && t.Status == SmartStudy.Server.Entities.Enums.TaskStatus.Completed
            select t.Id
        ).CountAsync();

        return new KpiSummaryDto
        {
            TotalUsers = totalUsers,
            ActiveUsersThisWeek = activeUsersThisWeek,
            TotalSystemHours = Math.Round(totalSystemHours, 2),
            TotalCompletedTasks = totalCompletedTasks
        };
    }

    public async Task<List<UserGrowthChartDto>> GetUserGrowthChartAsync(int days = 30)
    {
        if (days <= 0)
        {
            days = 30;
        }

        var fromDate = DateTime.UtcNow.Date.AddDays(-(days - 1));

        var grouped = await (
            from u in _context.Users.AsNoTracking()
            join ur in _context.Set<IdentityUserRole<int>>() on u.Id equals ur.UserId
            join r in _context.Roles.AsNoTracking() on ur.RoleId equals r.Id
            where r.NormalizedName == StudentRole && u.CreatedAt >= fromDate
            group u by u.CreatedAt.Date into g
            orderby g.Key
            select new
            {
                Date = g.Key,
                NewUsers = g.Count()
            }
        ).ToListAsync();

        return grouped
            .Select(x => new UserGrowthChartDto
            {
                Date = x.Date.ToString("dd/MM"),
                NewUsers = x.NewUsers
            })
            .ToList();
    }

    public async Task<List<BehaviorChartDto>> GetBehaviorChartAsync()
    {
        var grouped = await (
            from l in _context.Logs.AsNoTracking()
            join t in _context.Tasks.AsNoTracking() on l.TaskId equals t.Id
            join ur in _context.Set<IdentityUserRole<int>>() on t.UserId equals ur.UserId
            join r in _context.Roles.AsNoTracking() on ur.RoleId equals r.Id
            where r.NormalizedName == StudentRole
            group l by t.Type into g
            orderby g.Sum(x => x.ActualDuration) descending
            select new
            {
                TaskType = g.Key,
                TotalMinutes = g.Sum(x => x.ActualDuration)
            }
        ).ToListAsync();

        return grouped
            .Select(x => new BehaviorChartDto
            {
                TaskType = x.TaskType.ToString(),
                TotalHours = Math.Round(x.TotalMinutes / 60d, 2)
            })
            .ToList();
    }

    public async Task<PagedResult<UserAdminDto>> GetUsersForAdminAsync(int pageIndex, int pageSize)
    {
        pageIndex = pageIndex <= 0 ? 1 : pageIndex;
        pageSize = pageSize <= 0 ? 10 : pageSize;

        var now = DateTimeOffset.UtcNow;

        var query =
            from u in _context.Users.AsNoTracking()
            where (
                from ur in _context.Set<IdentityUserRole<int>>()
                join r in _context.Roles on ur.RoleId equals r.Id
                where ur.UserId == u.Id && r.NormalizedName == StudentRole
                select ur.UserId
            ).Any()
            orderby u.CreatedAt descending
            select new UserAdminDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty,
                CreatedAt = u.CreatedAt,
                IsActive = !u.LockoutEnd.HasValue || u.LockoutEnd <= now,
                TotalStudyHours = ((
                    from l in _context.Logs
                    join t in _context.Tasks on l.TaskId equals t.Id
                    where t.UserId == u.Id
                    select (double?)l.ActualDuration
                ).Sum() ?? 0d) / 60d
            };

        return await query.ToPagedResultAsync(pageIndex, pageSize);
    }

    public async Task<bool> ToggleUserStatusAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            throw new AppException("User not found");
        }

        var isActive = !user.LockoutEnd.HasValue || user.LockoutEnd <= DateTimeOffset.UtcNow;

        if (isActive && !user.LockoutEnabled)
        {
            var enableLockoutResult = await _userManager.SetLockoutEnabledAsync(user, true);
            if (!enableLockoutResult.Succeeded)
            {
                throw new AppException(string.Join("; ", enableLockoutResult.Errors.Select(e => e.Description)));
            }
        }

        var result = isActive
            ? await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue)
            : await _userManager.SetLockoutEndDateAsync(user, null);

        if (!result.Succeeded)
        {
            throw new AppException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return !isActive;
    }
}