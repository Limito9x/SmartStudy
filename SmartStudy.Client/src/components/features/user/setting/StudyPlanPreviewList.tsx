import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface StudyPlanItem {
  academicTermId: number | string;
  academicYearId: number | string;
  startDate: string;
  endDate: string;
}

interface StudyPlanPreviewListProps {
  studyPlans: StudyPlanItem[];
}

export function StudyPlanPreviewList({
  studyPlans,
}: StudyPlanPreviewListProps) {
  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <ScrollArea className="h-64">
        <div className="min-w-100">
          {studyPlans.map((s, index) => (
            <Card key={index} className="mb-2">
              <CardContent>
                <p>
                  Học kỳ {s.academicTermId} - Năm {s.academicYearId}
                </p>
                <p>
                  Từ {format(new Date(s.startDate), "dd/MM/yyyy")} đến{" "}
                  {format(new Date(s.endDate), "dd/MM/yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
