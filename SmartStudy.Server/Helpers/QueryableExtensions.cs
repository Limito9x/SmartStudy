using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;

namespace SmartStudy.Server.Helpers
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
            this IQueryable<T> query,
            int pageIndex,
            int pageSize)
        {
            // 1. Đếm tổng số record (để Frontend biết có bao nhiêu trang)
            var totalCount = await query.CountAsync();
            
            var normalizedIndex = Math.Max(0, pageIndex);
            var skip = normalizedIndex > 0 
                ? (normalizedIndex - 1) * pageSize  // 1-based
                : 0;                                 // 0-based fallback

            // 2. Cắt lấy đúng phần data của trang hiện tại
            var items = await query
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }
    }
}
