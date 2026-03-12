import { useRoutine } from "@/hooks/entities/useRoutine";
import { useSchedule } from "@/hooks/entities/useSchedule";
import { type SimpleResponseRoutineDto, type TaskType } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { weekdayMap } from "@/utils/calendar";
import RoutineForm from "@/components/forms/routine/RoutineForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { routineApiMapper } from "@/utils/mapper.ts/apiMapper";
import { useOutletContext } from "react-router-dom";
import { type StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";
import { addWeeks } from "date-fns";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  ClassSession: {
    icon: <BookOpen size={13} />,
    label: "Học lớp",
    color: "text-blue-500",
  },
  SelfStudy: {
    icon: <Brain size={13} />,
    label: "Tự học",
    color: "text-green-500",
  },
  AssignmentWork: {
    icon: <FileText size={13} />,
    label: "Bài tập",
    color: "text-orange-500",
  },
  Meeting: {
    icon: <Users size={13} />,
    label: "Họp nhóm",
    color: "text-purple-500",
  },
};

interface RoutineSidebarProps {
  selectedRoutineId?: number;
  onSelectRoutine: (routine: SimpleResponseRoutineDto) => void;
}

export default function RoutineSidebar({
  selectedRoutineId,
  onSelectRoutine,
}: RoutineSidebarProps) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { selectedStudyPlan } = useOutletContext<StudyPlanOutletContext>();
  const studyPlanId = Number(selectedStudyPlan?.id);

  const { getAllRoutines, createRoutine } = useRoutine();
  const { deleteSchedule } = useSchedule();

  const { data: routines } = getAllRoutines({
    studyPlanId: studyPlanId,
    type: filter === "all" ? undefined : (filter as TaskType),
  });

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { openDialog } = useDialogStore();

  const handleAddRoutine = () => {
    openDialog({
      title: "Thêm lịch trình",
      view: (
        <RoutineForm
          studyPlanId={studyPlanId}
          defaultValues={{
            name: "",
            description: "",
            type: "SelfStudy",
            startDate: new Date(selectedStudyPlan?.startDate ?? "")
              .toISOString()
              .split("T")[0],
            endDate: new Date(
              selectedStudyPlan?.endDate ?? addWeeks(new Date(), 1),
            )
              .toISOString()
              .split("T")[0],
          }}
          onSubmit={(values) => {
            console.log("Creating routine with values", values);
            createRoutine.mutate({
              body: routineApiMapper.toRequestRoutineDto(values, studyPlanId),
            });
          }}
        />
      ),
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 shrink-0 space-y-3">
        <div>
          <h2 className="text-xl font-bold">Lịch trình</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Chọn lịch trình rồi click vào khung giờ để xếp lịch
          </p>
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ClassSession">Học lớp</SelectItem>
            <SelectItem value="SelfStudy">Tự học</SelectItem>
            <SelectItem value="AssignmentWork">Bài tập</SelectItem>
            <SelectItem value="Meeting">Họp nhóm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {routines?.map((routine) => {
          const config = typeConfig[routine.type ?? "SelfStudy"];
          const isSelected = selectedRoutineId === routine.id;
          const isExpanded = expandedIds.has(Number(routine.id));

          return (
            <li
              key={routine.id}
              className={`rounded-lg border transition-colors ${isSelected ? "border-primary bg-accent" : "hover:bg-accent/50"}`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 p-3 cursor-pointer"
                onClick={() => onSelectRoutine(routine)}
              >
                <span className={config.color}>{config.icon}</span>
                <span className="font-semibold text-sm flex-1 truncate">
                  {routine.name}
                </span>
                {/* Expand schedules */}
                {routine.schedules?.length > 0 && (
                  <button
                    onClick={(e) => toggleExpand(Number(routine.id), e)}
                    className="opacity-50 hover:opacity-100"
                  >
                    {isExpanded ? (
                      <ChevronDown size={13} />
                    ) : (
                      <ChevronRight size={13} />
                    )}
                  </button>
                )}
              </div>

              {/* Schedules list */}
              {isExpanded && (
                <ul className="px-3 pb-3 flex flex-col gap-1">
                  {routine.schedules?.map((schedule) => (
                    <li
                      key={schedule.id}
                      className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1"
                    >
                      <span>
                        {weekdayMap[schedule.dayOfWeek]} · {schedule.startTime}
                      </span>
                      <button
                        onClick={() =>
                          deleteSchedule.mutate({
                            path: {
                              id: Number(schedule.id),
                            },
                          })
                        }
                        className="opacity-40 hover:opacity-100 hover:text-destructive ml-2"
                      >
                        <X size={11} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="p-4 shrink-0 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1"
          onClick={handleAddRoutine}
        >
          <Plus size={14} /> Thêm lịch trình
        </Button>
      </div>
    </div>
  );
}
