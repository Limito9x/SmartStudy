import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import type { ResponseSemesterDto, SemesterStatus } from "@/services/api";
import { format } from "date-fns";

interface SemesterCardProps {
  semester: ResponseSemesterDto;
  isSelected?: boolean;
  onSelect?: (semester: ResponseSemesterDto) => void;
}

type SemesterStatusMap = Record<
  SemesterStatus,
  {
    text: string;
    color: string;
  }
>;

const semesterStatusMap: SemesterStatusMap = {
  Active: { text: "Đang học", color: "bg-blue-500" },
  Past: { text: "Đã kết thúc", color: "bg-gray-500" },
  Future: { text: "Sắp tới", color: "bg-green-300" },
};

export default function SemesterCard({
  semester,
  isSelected,
  onSelect,
}: SemesterCardProps) {
  const title = `HK${semester.term} ${semester.year}`;
  const timeline = `${format(new Date(semester.startDate), "MM/yy")} - ${format(new Date(semester.endDate), "MM/yy")}`;
  const statusInfo = semesterStatusMap[semester.status];

  return (
    <Card
      className={`card-interactive w-48 ${isSelected ? "ring-2 ring-primary shadow-md" : ""}`}
      onClick={() => onSelect?.(semester)}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{semester.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {timeline}
        <div
          className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color} text-white`}
        >
          {statusInfo.text}
        </div>
      </CardContent>
    </Card>
  );
}
