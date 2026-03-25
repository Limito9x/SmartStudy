# KẾ HOẠCH TÁI CẤU TRÚC FRONTEND - TAB "TIẾN ĐỘ & CÔNG VIỆC" (WORKLOADS)

## 1. Mục tiêu (Context)
Refactor lại giao diện quản lý tiến độ học tập của Môn học (Course). 
Chuyển từ cấu trúc Tabs cũ lộn xộn sang giao diện **"Phân lô bán nền" (Group by Routine)** kết hợp **Accordion (Row mở rộng)** cho từng Task.
Giao diện phản ánh triết lý PDCA: Task -> Input (Tài liệu hướng dẫn) -> Output (Nhật ký/Logs bài làm).

## 2. Cấu trúc Dữ liệu (TypeScript Interfaces)
Dữ liệu từ API Backend sẽ trả về cấu trúc phân cấp như sau. AI cần bám sát cấu trúc này để map dữ liệu:

```typescript
// DTO Tổng trả về từ API
interface CourseWorkloadDto {
  course: ResponseCourseDto;
  routines: CourseRoutineDto[];
  singleTasks: CourseTaskDto[];
}

// Nhóm Routine (Khuôn lịch học)
interface CourseRoutineDto {
  routine: SimpleResponseRoutineDto;
  tasks: CourseTaskDto[];
}

// Lõi Task (Bao gồm Input và Output)
interface CourseTaskDto {
  task: ResponseTaskDto;
  docs: AssetResponseDto[]; // Tài liệu Input
  logs: LogDoc[];           // Kết quả Output
}

// Log và Tài liệu đính kèm của Log
interface LogDoc {
  log: LogDto;
  assets: AssetResponseDto[];
}

course-workloads/
 ├── WorkloadsTab.tsx          (File gốc: Component cha chứa toàn bộ UI tab này)
 ├── components/
 │    ├── RoutineGroup.tsx     (Render 1 khối Routine làm Section Header và danh sách Task con)
 │    ├── CourseTaskCard.tsx   (Render 1 Task dạng Accordion/Collapsible)
 │    ├── TaskInput.tsx        (Khu vực hiển thị Input Docs và nút đính kèm)
 │    └── TaskOutput.tsx       (Khu vực hiển thị Output Logs và nút viết Log mới)
 └── shared/
      ├── AssetListItem.tsx    (UI dòng hiển thị 1 file: icon, tên, nút tải xuống)
      └── ContextUploader.tsx  (Wrapper Component chứa FilePond trong Dialog)


A. WorkloadsTab.tsx
Nhận props là data: CourseWorkloadDto (Dữ liệu đã được fetch sẵn từ React Query ngoài trang CoursePage).

UI chia làm 2 khu vực dọc (Cuộn từ trên xuống):

Map mảng data.routines -> render các <RoutineGroup />.

Dưới cùng có Header "Công việc tự do / Standalone Tasks", map mảng data.singleTasks -> render các <CourseTaskCard />.

B. RoutineGroup.tsx
Nhận props routine: CourseRoutineDto.

UI: Dùng một thẻ div làm Section Header nổi bật (màu nền nhạt, viền trái) hiển thị routine.routine.name (VD: "LÝ THUYẾT - Thứ 3").

Bên dưới Header, map mảng routine.tasks để render danh sách <CourseTaskCard />.

C. CourseTaskCard.tsx
Dùng Collapsible của shadcn/ui.

Trigger (Tiêu đề Row): Hiện Icon tùy theo loại task, task.name, task.taskDate (Deadline), và Badge trạng thái.

Content (Mở rộng):

Dùng grid chia 2 cột (trên màn to) hoặc 2 hàng (màn nhỏ).

Cột 1: Gọi <TaskInput docs={task.docs} taskId={task.id} />.

Cột 2: Gọi <TaskOutput logs={task.logs} taskId={task.id} />.

D. TaskInput.tsx
Nhận props docs và taskId.

UI: Tiêu đề "📚 Tài liệu hướng dẫn".

Render list docs qua <AssetListItem />.

Dưới cùng gọi <ContextUploader linkedId={taskId} linkedType="Task" buttonText="Đính kèm tài liệu" />.

E. TaskOutput.tsx
Nhận props logs và taskId.

UI: Tiêu đề "📝 Nhật ký & Bài làm".

Map logs, mỗi log hiện nội dung Text, thời gian, và list assets của log đó.

Nút "Viết Nhật ký": Tạm thời render 1 Dialog rỗng, bên trong có 1 Textarea và <ContextUploader linkedType="Log" /> (Chưa cần xử lý logic tạo Log phức tạp vội, chỉ cần UI Form).

F. shared/ContextUploader.tsx
Import <AssetUploader /> (có chứa FilePond).

Dùng Dialog của shadcn/ui. Nút trigger nhận nội dung từ buttonText prop.

Bên trong Dialog Content render <AssetUploader linkedId={...} linkedType={...} />.

5. Quy chuẩn Code (Rules)
Sử dụng Tailwind CSS cho toàn bộ styling.

Sử dụng các components của shadcn/ui (Card, Badge, Button, Collapsible, Dialog, ScrollArea).

Sử dụng icon từ lucide-react.

Đảm bảo UI Responsive, hiển thị tốt trên Mobile.