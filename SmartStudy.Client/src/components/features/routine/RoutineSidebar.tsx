import { useRoutine } from "@/hooks/entities/useRoutine";
import RoutineCard from "./RoutineCard";
import { type SimpleResponseRoutineDto } from "@/services/api";

interface RoutineSidebarProps {
  studyPlanId: number;
  selectedRoutineId?: number;
  onSelectRoutine: (routine: SimpleResponseRoutineDto) => void;
}

export default function RoutineSidebar({
  studyPlanId,
  selectedRoutineId,
  onSelectRoutine,
}: RoutineSidebarProps) {
  const routineApi = useRoutine();
  const { data: routines } = routineApi.getAllRoutines({
    studyPlanId,
    type: undefined,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0">
        <h2 className="text-xl font-bold">Lịch trình</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Chọn lịch trình rồi click vào khung giờ để xếp lịch
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {routines?.map((routine) => (
          <li
            key={routine.id}
            onClick={() => onSelectRoutine(routine)}
            className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent
              ${selectedRoutineId === routine.id ? "selected" : ""}
            `}
          >
            <p className="font-semibold text-sm">{routine.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
