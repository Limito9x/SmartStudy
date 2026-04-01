import type { CourseRoutineDto } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import CourseTaskCard from "./CourseTaskCard";

interface RoutineGroupProps {
  routine: CourseRoutineDto;
  value: string;
}

export default function RoutineGroup({ routine, value }: RoutineGroupProps) {
  const routineName = routine.routine?.name || "Routine chưa đặt tên";
  const tasks = routine.tasks ?? [];

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-xl border bg-card px-0"
    >
      <AccordionTrigger className="gap-2 px-3 py-2.5 hover:bg-slate-50/70 hover:no-underline data-[state=open]:bg-slate-50/60">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Folder className="size-4 shrink-0 text-muted-foreground" />
            <h3 className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-foreground/90">
              {routineName}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="h-6 shrink-0 rounded-full px-2 text-xs font-medium text-muted-foreground"
          >
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-3 pt-2">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            Chưa có công việc trong routine này.
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <CourseTaskCard
                key={String(task?.id ?? `routine-task-${index}`)}
                taskData={task}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
