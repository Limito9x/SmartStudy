import {
  isMonday,
  nextMonday,
  addWeeks,
  endOfWeek,
} from "date-fns";

export function guessAcademicDates(termNumber: number, startYear: number) {
  let targetMonth = 0;
  let year = startYear;

  switch (termNumber) {
    case 1:
      targetMonth = 7; // Tháng 8 (bắt đầu năm học mới)
      break;
    case 2:
      targetMonth = 0; // Tháng 1 (của năm tiếp theo)
      year += 1;
      break;
    case 3: // Học kỳ hè
      targetMonth = 5; // Tháng 6 (của năm tiếp theo)
      year += 1;
      break;
    default:
      targetMonth = 7;
  }

  // Lấy ngày mùng 1 của tháng mục tiêu
  const firstDayOfMonth = new Date(year, targetMonth, 1);

  // 2. Tính Start Date: Phải là THỨ 2 đầu tiên của tháng
  // Nếu mùng 1 đã là Thứ 2 thì lấy luôn, nếu không thì tìm Thứ 2 tiếp theo
  const startDate = isMonday(firstDayOfMonth)
    ? firstDayOfMonth
    : nextMonday(firstDayOfMonth);

  // 3. Tính End Date: Cộng thêm 16 tuần, và chốt vào ngày Chủ Nhật
  // addWeeks(..., 15) tức là cộng thêm 15 tuần kể từ tuần đầu tiên = Tổng 16 tuần
  const dateAfter16Weeks = addWeeks(startDate, 15);

  // Lấy ngày cuối cùng của tuần đó.
  // weekStartsOn: 1 (Cấu hình tuần bắt đầu vào Thứ 2, kết thúc vào Chủ Nhật)
  const endDate = endOfWeek(dateAfter16Weeks, { weekStartsOn: 1 });

  return { startDate, endDate };
}
