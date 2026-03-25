import type { CourseRoutineDto } from "@/services/api";
import CourseTaskCard from "./CourseTaskCard";

interface RoutineGroupProps {
  routine: CourseRoutineDto;
}

export default function RoutineGroup({ routine }: RoutineGroupProps) {
  const routineName = routine.routine?.name || "Routine chưa đặt tên";
  const tasks = routine.tasks ?? [];

  return (
    <section className="space-y-3">
      <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
        <h3 className="text-sm font-semibold">{routineName}</h3>
        <p className="text-xs text-muted-foreground">
          Nhóm công việc thuộc routine này.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
          Chưa có công việc trong routine này.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <CourseTaskCard
              key={String(task.task?.id ?? `routine-task-${index}`)}
              taskData={task}
            />
          ))}
        </div>
      )}
    </section>
  );
}
