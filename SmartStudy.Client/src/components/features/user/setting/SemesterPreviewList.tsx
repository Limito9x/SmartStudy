import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FormSemesterItem } from "@/utils/semesterGenerator";
import { format } from "date-fns";

interface SemesterPreviewListProps {
  semesters: FormSemesterItem[];
}

export function SemesterPreviewList({ semesters }: SemesterPreviewListProps) {
  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <ScrollArea className="h-64">
        <div className="min-w-100">
          {semesters.map((s, index) => (
            <Card key={index} className="mb-2">
              <CardContent>
                <p>
                  Học kỳ {s.term} - Năm {s.year}
                </p>
                <p>
                  Từ {format(s.startDate, "dd/MM/yyyy")} đến{" "}
                  {format(s.endDate, "dd/MM/yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
