using SmartStudy.Server.Exceptions;
using System.Net;
using System.Text.Json;

namespace SmartStudy.Server.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            // Mặc định là lỗi 500 (Lỗi code, rớt mạng DB...)
            int statusCode = (int)HttpStatusCode.InternalServerError;
            string message = "Đã xảy ra lỗi. Vui lòng thử lại sau.";

            // Phân loại lỗi theo AppException (lỗi do client gửi yêu cầu không hợp lệ)
            if (ex is AppException appEx)
            {
                statusCode = (int)HttpStatusCode.BadRequest; // 400
                message = appEx.Message;
                _logger.LogWarning("Lỗi thao tác từ User: {Message}", appEx.Message);
            }
            else if (ex is KeyNotFoundException)
            {
                statusCode = (int)HttpStatusCode.NotFound; // 404
                message = "Không tìm thấy dữ liệu yêu cầu.";
                _logger.LogWarning("Lỗi không tìm thấy dữ liệu: {Message}", ex.Message);
            }
            else // Lỗi ở server (500) nhưng có thể phân loại thêm nếu cần
            {
                //Log lại
                _logger.LogError(ex, "Lỗi hệ thống không xác định: {Message}", ex.Message);
            }

            context.Response.StatusCode = statusCode;
            var json = JsonSerializer.Serialize(new { message = message });
            await context.Response.WriteAsync(json);
        }
    }
}
