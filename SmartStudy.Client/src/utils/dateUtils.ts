import { parseISO, format, isSameDay, isToday } from "date-fns";

export const weekdayMap: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "Chủ nhật",
};

/**
 * Làm tròn thời gian hiện tại đến mốc gần nhất (0, 15, 30, 45 phút)
 * Ví dụ: 14:23 -> 14:30, 14:12 -> 14:15, 14:37 -> 14:45
 */
export const roundToNearestQuarterHour = (date: Date = new Date()): Date => {
  const minutes = date.getMinutes();
  const remainder = minutes % 15;

  let roundedMinutes = minutes - remainder;
  if (remainder >= 8) {
    roundedMinutes += 15;
  }

  const rounded = new Date(date);
  rounded.setMinutes(roundedMinutes);
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);

  return rounded;
};

/**
 * Lấy thời gian bắt đầu (làm tròn đến 15 phút gần nhất)
 * và thời gian kết thúc (startDate + 30 phút)
 */
export const getRoundedStartAndEndDates = (): {
  startDate: Date;
  endDate: Date;
} => {
  const startDate = roundToNearestQuarterHour();
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30);

  return { startDate, endDate };
};

export const formatTaskDateTime = (
  startIsoString?: string | null,
  endIsoString?: string | null,
) => {
  if (!startIsoString || !endIsoString) return "Chưa có thời gian";
  const start = parseISO(startIsoString);
  const end = parseISO(endIsoString);

  // Kịch bản 1: Cùng ngày
  if (isSameDay(start, end)) {
    return `${format(start, "dd/MM/yyyy | HH:mm")} - ${format(end, "HH:mm")}`;
  }

  // Kịch bản 2: Vắt qua ngày hôm sau
  return `${format(start, "dd/MM/yyyy, HH:mm")} - ${format(end, "dd/MM/yyyy, HH:mm")}`;
};

export const formatTimeForTodayView = (
  startIso?: string | null,
  endIso?: string | null,
) => {
  if (!startIso || !endIso) return "--:--";

  const start = parseISO(startIso);
  const end = parseISO(endIso);

  // KỊCH BẢN 1: Task thuộc nhóm "HÔM NAY"
  if (isToday(start)) {
    if (isSameDay(start, end)) {
      // Cùng ngày: Chỉ hiện giờ (VD: 13:00 - 15:00)
      return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
    } else {
      // Vắt qua ngày mai: (VD: 23:00 - 02:00 (+1 ngày))
      return `${format(start, "HH:mm")} - ${format(end, "HH:mm")} (+1 ngày)`;
    }
  }

  // KỊCH BẢN 2: Task thuộc nhóm "QUÁ HẠN" (hoặc ngày khác)
  // Cần hiện thêm Ngày/Tháng để biết trễ từ lúc nào
  if (isSameDay(start, end)) {
    // Cùng ngày: (VD: 31/03, 13:00 - 15:00)
    return `${format(start, "dd/MM, HH:mm")} - ${format(end, "HH:mm")}`;
  } else {
    // Vắt qua ngày: (VD: 31/03, 23:00 - 01/04, 02:00)
    return `${format(start, "dd/MM, HH:mm")} - ${format(end, "dd/MM, HH:mm")}`;
  }
};
