import { addWeeks } from "date-fns";

export interface FormSemesterItem{
    term: 1|2|3;
    year: number;
    startDate: Date;
    endDate: Date;
}

export function generateSemesters(
    admissionDate: Date, // Ngày nhập học
    programLength: number, // Thời gian đào tạo (số năm)
    semestersPerYear: number, // Số học kỳ mỗi năm
    weeksPerSemester: number, // Số tuần mỗi học kỳ
    weeksOfSummerSemester: number | null, // Số tuần của học kỳ hè
): FormSemesterItem[] {
    const semesters: FormSemesterItem[] = [];
    let currentDate = new Date(admissionDate);
    for(let i=0; i < programLength; i++) {
        const currentYear = currentDate.getFullYear();
        const firstSemesterStartDate = new Date(currentDate);
        const firstSemesterEndDate = addWeeks(firstSemesterStartDate, weeksPerSemester);

        semesters.push({
            term: 1,
            year: currentYear,
            startDate: firstSemesterStartDate,
            endDate: firstSemesterEndDate,
        });

        const secondSemesterStartDate = addWeeks(firstSemesterEndDate, 2); // Nghỉ giữa học kỳ - ước lượng 2 tuần
        const secondSemesterEndDate = addWeeks(secondSemesterStartDate, weeksPerSemester);
        
        semesters.push({
            term: 2,
            year: currentYear,
            startDate: secondSemesterStartDate,
            endDate: secondSemesterEndDate,
        });

        const thirdSemesterStartDate = addWeeks(secondSemesterEndDate, 2); // Nghỉ giữa học kỳ - ước lượng 2 tuần
        let weeksToAdd = 8;
        // 2 kỳ chính + 1 kỳ hè
        if(semestersPerYear===2 && weeksOfSummerSemester) {
            weeksToAdd = weeksOfSummerSemester;
        }
        // 3 kỳ chính
        else if(semestersPerYear===3){
            weeksToAdd = weeksPerSemester;
        }

        const thirdSemesterEndDate = addWeeks(thirdSemesterStartDate, weeksToAdd);
        if(semestersPerYear===3 || (semestersPerYear===2 && weeksOfSummerSemester)) {
            semesters.push({
                term: 3,
                year: currentYear,
                startDate: thirdSemesterStartDate,
                endDate: thirdSemesterEndDate,
            });
        }

        currentDate = addWeeks(thirdSemesterEndDate, 2); // Nghỉ giữa năm - ước lượng 2 tuần
    }
    return semesters;
}