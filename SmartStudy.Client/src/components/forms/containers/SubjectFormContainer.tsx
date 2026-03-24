import { useSubject } from "@/hooks/entities/useSubject"; // File useSubject.ts của bác
import SubjectForm from "../subject/SubjectForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { SubjectFormValues } from "../subject/schema";
import { subjectApiMapper } from "@/utils/mapper.ts/apiMapper";
import { subjectFormMapper } from "@/utils/mapper.ts/formMapper";

export default function SubjectFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { subjectId, defaultValues } =
    data as DialogDataMap["SUBJECT_FORM"];

  const isEditMode = !!subjectId;
  const { getSubjectById, createSubject, updateSubject } = useSubject();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: subjectData, isLoading } = getSubjectById(subjectId!);

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
    isEditMode && subjectData
      ? subjectFormMapper.toFormValues(subjectData) // Map lại chuẩn form nếu cần
      : {
        name: defaultValues?.name || "",
        code: defaultValues?.code || "",
        credits: defaultValues?.credits || null,
        type: defaultValues?.type || "Academic",
      };

      

  const handleSubmit = (values: SubjectFormValues) => {
    if (isEditMode) {
      updateSubject.mutate(
        {
          path: { subjectId: subjectId! },
          body: subjectApiMapper.toRequestSubjectDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createSubject.mutate(
        {
          body: subjectApiMapper.toRequestSubjectDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <SubjectForm
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
