# Ngữ cảnh hệ thống (System Context):
Tôi đang xây dựng trang "Chi tiết Khóa học" (Course Detail) cho hệ thống LMS sử dụng React, TypeScript, TailwindCSS, thư viện shadcn/ui và lucide-react cho icon.

### Yêu cầu:
Hãy tạo ra một component CourseDetailTabs quản lý 4 Tabs: "Tổng quan", "Lộ trình", "Lịch sử học", và "Tài liệu".
Giả định tôi đã truyền vào các props chứa dữ liệu (Course, list Routines, list Tasks, list TimelineEvents, list Assets).

### Thiết kế chi tiết từng Tab:

1. Tab "Tổng quan" (OverviewTab):

Header Card: Hiển thị thông tin chung của Course: Name, Goal (Mục tiêu), TargetScore (Điểm mục tiêu). Thiết kế dạng Card sang trọng.

Danh sách Lịch trình (Routines): Hiển thị danh sách các Routine (Ca học định kỳ) thuộc khóa học. Render mỗi Routine thành 1 Card nhỏ, hiển thị Name, Type (badge màu sắc theo loại), và danh sách thứ/giờ học (Schedules). Có trạng thái Empty nếu không có Routine.

2. Tab "Lộ trình" (TimelineTab):

Dữ liệu: Gộp các Task có status === 'Pending' và các TimelineEvent lại, sort tăng dần theo ngày (taskDate / dueDate).

UI: Thiết kế dạng Vertical Timeline (Dòng thời gian dọc) ở bên trái.

Item: Với mỗi sự kiện, hiển thị Icon (tùy thuộc vào loại Task/Event), Ngày tháng, Tiêu đề, Thời lượng dự kiến (plannedDuration) hoặc Ưu tiên (priority). Dùng màu sắc nhạt nhẹ nhàng để phân biệt Task thường và Sự kiện quan trọng (Exam, Deadline).

3. Tab "Lịch sử học" (HistoryFeedTab):

Dữ liệu: Lấy các Task có status === 'Completed' và có chứa dữ liệu LogWork. Sort giảm dần theo ngày (mới nhất lên đầu).

UI: Render dưới dạng Feed / Nhật ký (Diary style).

Item: Mỗi item là một lần học xong. Hiển thị: Tiêu đề Task, Ngày hoàn thành, Số phút học thực tế (actualDuration), Badge Mức độ khó (difficultyLevel 1-5), và đoạn text Ghi chú (note) bọc trong một khối nền xám nhạt (bg-gray-50) giống một câu quote.

4. Tab "Tài liệu" (AssetsVaultTab):

Dữ liệu: Nhận vào danh sách Asset. Các Asset có thể liên kết trực tiếp với Course, hoặc liên kết với Task thuộc Course đó.

UI: Hiển thị dạng List View (Danh sách dọc).

Group: Chia làm 2 nhóm rõ rệt (dùng title hoặc separator): "Tài liệu chung" và "Tài liệu từ các buổi học".

Item: Dùng Icon của lucide-react để minh họa loại file (FileText cho PDF/Doc, Image cho ảnh, Link cho URL). Hiển thị: Icon, Tên file, Ngày tải lên. Nếu file thuộc về Task, hiển thị thêm 1 cái Badge nhỏ chỉ rõ tên Task đó (VD: 📌 Đính kèm từ: Giải đề Unit 1). Có nút Download (icon) ở bên phải cùng.

Quy tắc Code:

Sử dụng các component của shadcn/ui: <Tabs>, <TabsList>, <TabsTrigger>, <TabsContent>, <Card>, <Badge>, <Separator>, <ScrollArea>.

Chia nhỏ mỗi Tab thành các sub-component để file không bị quá dài.

Xử lý rỗng (Empty States) tinh tế cho từng Tab nếu mảng dữ liệu bằng 0.