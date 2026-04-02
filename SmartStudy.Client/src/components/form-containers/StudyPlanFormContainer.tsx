import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import StudyPlanForm from "@/components/forms/study-plan/StudyPlanForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { StudyPlanFormValues } from "@/components/forms/study-plan/schema";
import { studyPlanApiMapper } from "@/utils/mapper.ts/apiMapper";
import { studyPlanFormMapper } from "@/utils/mapper.ts/formMapper";
import { addMonths } from "date-fns";

export default function StudyPlanFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { studyPlanId, defaultValues } =
    data as DialogDataMap["STUDY_PLAN_FORM"];

  const isEditMode = !!studyPlanId;
  const { getStudyPlanById, createStudyPlan, updateStudyPlan } = useStudyPlan();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: studyPlanData, isLoading } = getStudyPlanById(studyPlanId!);

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
    isEditMode && studyPlanData
      ? studyPlanFormMapper.toFormValues(studyPlanData) // Map lại chuẩn form nếu cần
      : {
          name: defaultValues?.name || "",
          startDate: new Date(), // Mặc định là hôm nay
          endDate: addMonths(new Date(),1), // Mặc định là 1 tháng sau
          termId: defaultValues?.termId || null,
          yearId: defaultValues?.yearId || null,
          type: defaultValues?.type || "Academic",
        };

  const handleSubmit = (values: StudyPlanFormValues) => {
    if (isEditMode) {
      updateStudyPlan.mutate(
        {
          path: { studyPlanId: Number(studyPlanData?.id)! },
          body: studyPlanApiMapper.toRequeststudyPlanDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createStudyPlan.mutate(
        {
          body: studyPlanApiMapper.toRequeststudyPlanDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <StudyPlanForm
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
