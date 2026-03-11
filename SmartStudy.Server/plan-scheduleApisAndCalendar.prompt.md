## Plan: Schedule APIs và Calendar

Tách rõ phần `schedule` khỏi `routine`, chuẩn hóa DTO đang bị trùng, rồi bổ sung một service/controller riêng để xử lý create/update/delete schedule và truy vấn calendar theo `studyPlan`. Phần `calendar` nên lấy dữ liệu từ `TaskItem` đã được generate sẵn, vì entity này đã có đủ `TaskDate`, `StartTime`, `DurationMinutes`, `Location` để map ra dữ liệu hiển thị.

### Steps
1. Rà soát và hợp nhất DTO trong [`Dtos/ScheduleDto.cs`](Dtos/ScheduleDto.cs) và [`Dtos/RoutineDto.cs`](Dtos/RoutineDto.cs), tránh trùng `ScheduleDto`.
2. Định nghĩa `IScheduleService` đầy đủ trong [`Services/Schedule/ScheduleService.cs`](Services/Schedule/ScheduleService.cs) cho `Create`, `Update`, `Delete`, `GetCalendar`.
3. Triển khai kiểm tra ownership qua `Schedule -> Routine -> Course -> StudyPlan` bằng [`Data/ApplicationDbContext.cs`](Data/ApplicationDbContext.cs) và `ICurrentUserService`.
4. Thêm controller mới như [`Controllers/ScheduleController.cs`](Controllers/ScheduleController.cs) với `POST`, `PATCH {id}`, `DELETE {id}`, `GET calendar`.
5. Tạo DTO calendar chuyên dụng từ `TaskItem` trong [`Entities/TaskItem.cs`](Entities/TaskItem.cs) với `startDate`, `startTime`, `endTime`, `location`.
6. Đăng ký `IScheduleService` trong [`Program.cs`](Program.cs) và cập nhật chỗ dùng `ScheduleDto` trong `IRoutineService`/`ICourseService`.

### Further Considerations
1. Route `calendar` nên đặt ở đâu? Option A: `api/schedules/calendar`; Option B: `api/study-plans/{studyPlanId}/calendar`; Option C: cả hai nhưng chỉ giữ một chuẩn public.
2. `calendar` chỉ lấy `TaskItem` đã sinh sẵn hay tự tính trực tiếp từ `Schedule`? Khuyến nghị Option A: lấy từ `TaskItem` để nhất quán dữ liệu thực tế.
3. Khi tạo/xóa/cập nhật `schedule`, có cần đồng bộ lại future `TaskItem` liên quan không? Khuyến nghị xác định rõ rule trước khi implement.

### Implementation
1. Route Schedule sẽ tập trung CRUD trên thực thể Schedule. Calendar được tạo trên route riêng /calendar
2. Hãy làm theo khuyến nghị Option A: lấy dữ liệu calendar từ `TaskItem` đã sinh sẵn
3. Cần đồng bộ, nhưng thay đổi quyết định lại chỉ cần làm create và delete. Khi create sẽ sinh ra `TaskItem` tương ứng, khi delete sẽ xóa `TaskItem` đang pending.