## Plan: Admin Dashboard API

Bản nháp kế hoạch: bổ sung DTO, service, controller cho Admin Dashboard theo đúng contract bạn yêu cầu, tận dụng LINQ + EF Core để query gọn và hiệu quả, dùng `UserManager<User>` cho khóa/mở user, và bắt buộc phân trang bằng `ToPagedResultAsync`. Kế hoạch này giữ đúng cấu trúc hiện tại của dự án để triển khai nhanh, ít rủi ro sai lệch.

### Steps
1. Tạo DTO admin trong [Dtos/AdminDashboardDto.cs](Dtos/AdminDashboardDto.cs) với `KpiSummaryDto`, `UserGrowthChartDto`, `BehaviorChartDto`, `UserAdminDto`.
2. Khai báo `IAdminDashboardService` và implement trong [Services/Dashboard/AdminDashboardService.cs](Services/Dashboard/AdminDashboardService.cs), inject `ApplicationDbContext`, `UserManager<User>`.
3. Viết `GetKpiSummaryAsync`, `GetUserGrowthChartAsync`, `GetBehaviorChartAsync` bằng LINQ group/aggregate trên `Users`, `Logs`, `Tasks`.
4. Viết `GetUsersForAdminAsync` trả `PagedResult<UserAdminDto>`, tính `IsActive`, `TotalStudyHours`, gọi đuôi `ToPagedResultAsync`.
5. Viết `ToggleUserStatusAsync` bằng `UserManager` để lock/unlock qua `SetLockoutEndDateAsync` theo trạng thái hiện tại.
6. Tạo [Controllers/AdminDashboardController.cs](Controllers/AdminDashboardController.cs) với `[Authorize(Roles = "Admin")]`, đủ 5 endpoint, rồi đăng ký DI trong [Program.cs](Program.cs).

### Further Considerations
1. `User.CreatedAt` hiện chưa có trong `AspNetUsers`: A) thêm property + migration, B) đổi DTO field, C) tạm dùng giá trị mặc định.
2. `TotalUsers` nên tính tất cả user hay chỉ role `Student`? A) all users, B) students only, C) tách 2 chỉ số.
3. `BehaviorChart` có cần trả cả `TaskType` không có log? A) chỉ loại có dữ liệu, B) luôn trả đủ enum, C) cấu hình theo query param.

### Answer
1. Chọn A
2. Chọn B
3. Chọn A