import type { ResponseRoutineDto } from "@/services/api";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

interface RoutineCardProps {
  routine: ResponseRoutineDto;
}

export default function RoutineCard({ routine }: RoutineCardProps) {
  return (
    <Card className="group relative flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pr-10">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-semibold text-base leading-tight">
            {routine.name}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{routine.description}</p>
      </CardContent>
    </Card>
  );
}
