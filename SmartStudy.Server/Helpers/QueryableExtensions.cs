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

            // 2. Cắt lấy đúng phần data của trang hiện tại
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
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
