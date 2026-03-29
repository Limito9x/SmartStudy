import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
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
      onTermChange(terms[0].id?.toString() || "");
    }
    if (years.length > 0 && !selectedYear) {
      onYearChange(years[0].id?.toString() || "");
    }
  }, [terms, years, selectedTerm, selectedYear, onTermChange, onYearChange]);

  return (
    <div className="flex w-full gap-4 items-start">
      {/* SELECT HỌC KỲ */}
      <div className="flex-1">
        <Label className="text-sm">Học kỳ</Label>
        <Select value={selectedTerm || ""} onValueChange={onTermChange}>
          <SelectTrigger className="w-full h-8 bg-transparent border-gray-200">
            <SelectValue placeholder="Chọn học kỳ" />
          </SelectTrigger>
          <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term.id} value={term.id?.toString() || ""}>
                  {term.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-sm">Năm học</Label>
        <Select value={selectedYear || ""} onValueChange={onYearChange}>
          <SelectTrigger className="w-full h-8 bg-transparent border-gray-200">
            <SelectValue placeholder="Chọn năm học" />
          </SelectTrigger>
          <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.id} value={year.id?.toString() || ""}>
                  {year.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {/* SELECT NĂM HỌC */}
    </div>
  );
}
