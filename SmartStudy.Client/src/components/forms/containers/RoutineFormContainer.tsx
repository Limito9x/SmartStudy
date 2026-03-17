import { useRoutine } from "@/hooks/entities/useRoutine"; // File useRoutine.ts của bác
import RoutineForm from "../routine/RoutineForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { RoutineFormValues } from "../routine/schema";
import { routineApiMapper } from "@/utils/mapper.ts/apiMapper";
import { routineFormMapper } from "@/utils/mapper.ts/formMapper";

export default function RoutineFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { studyPlanId, routineId, defaultValues } =
    data as DialogDataMap["ROUTINE_FORM"];

  const isEditMode = !!routineId;
  const { getRoutineById, createRoutine, updateRoutine } = useRoutine();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: RoutineData, isLoading } = getRoutineById(routineId!);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && RoutineData
      ? routineFormMapper.toFormValues(RoutineData) // Map lại chuẩn form nếu cần
      : {
        ...defaultValues,
        name: defaultValues?.name || "",
        type: defaultValues?.type || "SelfStudy",
      };

      

  const handleSubmit = (values: RoutineFormValues) => {
    if (isEditMode) {
      updateRoutine.mutate(
        {
          path: { id: routineId! },
          body: routineApiMapper.toRequestRoutineDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createRoutine.mutate(
        {
          body: routineApiMapper.toRequestRoutineDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <RoutineForm
      studyPlanId={studyPlanId}
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
