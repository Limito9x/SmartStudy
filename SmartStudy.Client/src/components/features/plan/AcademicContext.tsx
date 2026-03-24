import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import { useEffect } from "react";

interface AcademicContextProps {
  selectedTerm: string|null;
  onTermChange: (value: string) => void;
  selectedYear: string|null;
  onYearChange: (value: string) => void;
}

export default function AcademicContext({
  selectedTerm,
  onTermChange,
  selectedYear,
  onYearChange,
}: AcademicContextProps) {
  const { getAcademicContext } = useStudyPlan();
  const { data: academicContext } = getAcademicContext;

  const terms = academicContext?.terms || [];
  const years = academicContext?.years || [];

  useEffect(() => {
    if (terms.length > 0 && !selectedTerm) {
      onTermChange(terms[0].termNumber?.toString() || "");
    }
    if (years.length > 0 && !selectedYear) {
      onYearChange(years[0].startYear?.toString() || "");
    }
  }, [terms, years, selectedTerm, selectedYear, onTermChange, onYearChange]);

  return (
    <div className="p-4 flex gap-2 items-center justify-between border-b">
      {/* SELECT HỌC KỲ */}
      <Select value={selectedTerm||""} onValueChange={onTermChange}>
        <SelectTrigger className="w-full h-8 bg-transparent border-gray-200">
          <SelectValue placeholder="Chọn học kỳ" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Học kỳ</SelectLabel>
          {terms.map((term) => (
            <SelectItem
              key={term.termNumber}
              value={term.termNumber?.toString() || ""}
            >
              {term.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* SELECT NĂM HỌC */}
      <Select value={selectedYear||""} onValueChange={onYearChange}>
        <SelectTrigger className="w-full h-8 bg-transparent border-gray-200">
          <SelectValue placeholder="Chọn năm học" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Năm học</SelectLabel>
          {years.map((year) => (
            <SelectItem
              key={year.startYear}
              value={year.startYear?.toString() || ""}
            >
              {year.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
