import { addWeeks } from "date-fns";
import type { RequestStudyPlanDto } from "@/services/api";

export function generateSemesters({
  admissionDate, // Ngày nhập học
  programLength, // Thời gian đào tạo (số năm)
  semestersPerYear, // Số học kỳ mỗi năm
  weeksPerSemester, // Số tuần mỗi học kỳ
  weeksOfSummerSemester, // Số tuần của học kỳ hè
}: {
  admissionDate: Date;
  programLength: number;
  semestersPerYear: number;
  weeksPerSemester: number;
  weeksOfSummerSemester: number | null;
}): RequestStudyPlanDto[] {
  const semesters: RequestStudyPlanDto[] = [];
  let currentDate = new Date(admissionDate);
  for (let i = 0; i < programLength; i++) {
    const currentYear = currentDate.getFullYear();
    for (let j = 1; j <= 3; j++) {
      const term = j;
      const startDate = new Date(currentDate);
      let endDate: Date;
      if (term === 2) {
        endDate = addWeeks(startDate, weeksPerSemester + 2); // Học kỳ 2 có thể dài hơn 2 tuần do kỳ nghỉ Tết
      }
      if (term === 3 && weeksOfSummerSemester !== null) {
        endDate = addWeeks(startDate, weeksOfSummerSemester);
      } else {
        endDate = addWeeks(startDate, weeksPerSemester);
      }
      semesters.push({
        academicTermId: term,
        academicYearId: currentYear,
        startDate: startDate.toISOString(), // Định dạng YYYY-MM-DD
        endDate: endDate.toISOString(), // Định dạng YYYY-MM-DD
      });
      const breakWeeks = semestersPerYear === 2 && j === 3 ? 6 : 2;
      currentDate = addWeeks(endDate, breakWeeks); // Bắt đầu học kỳ tiếp theo sau 4 tuần nghỉ
    }
  }
  return semesters;
}
