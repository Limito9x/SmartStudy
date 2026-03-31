import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";
import {
  type Control,
  type FieldValues,
  type Path,
  useWatch,
  type UseFormSetValue,
} from "react-hook-form";
import { useEffect } from "react";

interface AcademicContextProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  termName: Path<T>;
  yearName: Path<T>;
  minYear?: number | undefined;
  useAcademicContext?: (term: number, year: number) => void;
}

// 1. Hàm helper tính toán Học kỳ & Năm học hiện tại
const getCurrentAcademicTarget = () => {
  const now = new Date();
  const month = now.getMonth(); // getMonth() trả về 0 (Tháng 1) đến 11 (Tháng 12)
  const currentYear = now.getFullYear();

  if (month >= 7) {
    // Tháng 8 - 12: Học kỳ 1 của năm nay
    return { targetTermNumber: 1, targetStartYear: currentYear };
  } else if (month >= 0 && month <= 4) {
    // Tháng 1 - 5: Học kỳ 2 của năm ngoái
    return { targetTermNumber: 2, targetStartYear: currentYear - 1 };
  } else {
    // Tháng 6 - 7: Học kỳ hè (3) của năm ngoái
    return { targetTermNumber: 3, targetStartYear: currentYear - 1 };
  }
};

export default function FormAcademicContext<T extends FieldValues>({
  control,
  setValue,
  termName,
  yearName,
  minYear,
  useAcademicContext,
}: AcademicContextProps<T>) {
  const { getAcademicContext } = useStudyPlan();
  const { data: academicContext } = getAcademicContext;

  const terms = academicContext?.terms || [];
  const years =
    academicContext?.years?.filter(
      (year) => !minYear || Number(year.startYear) >= minYear,
    ) || [];

  const currentTermValue = useWatch({ control, name: termName });
  const currentYearValue = useWatch({ control, name: yearName });

  useEffect(() => {
    // Nếu chưa load xong data thì bỏ qua
    if (terms.length === 0 || years.length === 0) return;

    // 2. Lấy thông số dự đoán
    const { targetTermNumber, targetStartYear } = getCurrentAcademicTarget();

    // 3. Set Term thông minh
    if (!currentTermValue) {
      // Tìm HK khớp với dự đoán (giả sử term có prop termNumber, nếu không bác có thể check term.name.includes(targetTermNumber.toString()))
      const matchedTerm =
        terms.find((t: any) => t.termNumber === targetTermNumber) || terms[0];
      setValue(termName, matchedTerm.id?.toString() as any, {
        shouldValidate: true,
      });
    }

    // 4. Set Year thông minh
    if (!currentYearValue) {
      // Tìm Năm học có startYear khớp với dự đoán
      const matchedYear =
        years.find((y: any) => Number(y.startYear) === targetStartYear) ||
        years[0];
      setValue(yearName, matchedYear.id?.toString() as any, {
        shouldValidate: true,
      });
    }

    // Callback trigger (đã có sẵn của bác)
    if (useAcademicContext && currentTermValue && currentYearValue) {
      useAcademicContext(Number(currentTermValue), Number(currentYearValue));
    }

    // Lưu ý: Không đưa currentTermValue và currentYearValue vào deps để tránh re-render / loop vô tận khi user tự đổi dropdown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms, years, setValue, termName, yearName, useAcademicContext]);

  return (
    <div className="flex w-full gap-4 items-start">
      <div className="flex-1">
        <FormField
          control={control}
          name={termName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Học kỳ</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full bg-transparent border-gray-200">
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term: any) => (
                      <SelectItem
                        key={term.id}
                        value={term.id?.toString() || ""}
                      >
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex-1">
        <FormField
          control={control}
          name={yearName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Năm học</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full bg-transparent border-gray-200">
                    <SelectValue placeholder="Chọn năm học" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year: any) => (
                      <SelectItem
                        key={year.id}
                        value={year.id?.toString() || ""}
                      >
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
