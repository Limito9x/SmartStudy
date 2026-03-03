import SemesterCard from "./SemesterCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type ResponseSemesterDto } from "@/services/api";

interface SemesterListProps {
  semesters: ResponseSemesterDto[];
  selectedSemesterId?: number | null;
  onSelectSemester?: (semester: ResponseSemesterDto) => void;
}

export default function SemesterList({
  semesters,
  selectedSemesterId,
  onSelectSemester,
}: SemesterListProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex w-max space-x-4 gap-2 pt-2 pb-4">
        {semesters.map((semester) => (
          <SemesterCard
            key={semester.id}
            semester={semester}
            onSelect={onSelectSemester}
            isSelected={semester.id === selectedSemesterId}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
