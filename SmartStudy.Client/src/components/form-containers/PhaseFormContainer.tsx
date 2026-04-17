import { useDialogStore, type DialogDataMap } from "@/stores/useDialogStore";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { BaseForm } from "@/components/forms/base/BaseForm";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
} from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { addMonths } from "date-fns";

// ─── Schema riêng cho Phase ───────────────────────────────────────────────────
const phaseFormSchema = z.object({
  title: z.string().min(1, "Tên giai đoạn không được để trống").max(200),
  type: z.enum(
    ["General", "ExamPrep", "Project", "Assignment", "Custom"] as const,
    {
      message: "Vui lòng chọn loại giai đoạn",
    },
  ),
  priority: z.coerce
    .number()
    .min(1, "Mức độ ưu tiên phải từ 1 đến 3")
    .max(3, "Mức độ ưu tiên phải từ 1 đến 3"),
  startDateTime: z.date(),
  endDateTime: z.date(),
  notes: z.string().nullable().optional(),
});

type PhaseFormValues = z.infer<typeof phaseFormSchema>;

const PHASE_TYPE_OPTIONS = [
  { label: "Ôn thi", value: "ExamPrep" },
  { label: "Đồ án / Dự án", value: "Project" },
  { label: "Bài tập lớn", value: "Assignment" },
  { label: "Tuỳ chỉnh", value: "Custom" },
];

const PRIORITY_OPTIONS = [
  {
    value: 1,
    label: "Thấp",
    activeClassName: "border-emerald-300 bg-emerald-100 text-emerald-800",
  },
  {
    value: 2,
    label: "Vừa",
    activeClassName: "border-amber-300 bg-amber-100 text-amber-800",
  },
  {
    value: 3,
    label: "Cao",
    activeClassName: "border-rose-300 bg-rose-100 text-rose-800",
  },
] as const;

// ─── Container ────────────────────────────────────────────────────────────────
export default function PhaseFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { courseId, phaseId } = data as DialogDataMap["PHASE_FORM"];

  const isEditMode = !!phaseId;
  const { getEventById, createEvent, updateEvent } = useTimelineEvent({
    courseId,
  });
  const { data: phaseData, isLoading } = getEventById(phaseId!);

  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const defaultValues: PhaseFormValues =
    isEditMode && phaseData
      ? {
          title: phaseData.title ?? "",
          type: (phaseData.type as PhaseFormValues["type"]) ?? "ExamPrep",
          priority: Number(phaseData.priority ?? 1),
          startDateTime: phaseData.startDateTime
            ? new Date(phaseData.startDateTime)
            : new Date(),
          endDateTime: phaseData.endDateTime
            ? new Date(phaseData.endDateTime)
            : addMonths(new Date(), 1),
          notes: phaseData.notes ?? "",
        }
      : {
          title: "",
          type: "ExamPrep",
          priority: 1,
          startDateTime: new Date(),
          endDateTime: addMonths(new Date(), 1),
          notes: "",
        };

  const handleSubmit = (values: PhaseFormValues) => {
    const body = {
      courseId,
      title: values.title,
      type: values.type,
      startDateTime: values.startDateTime.toISOString(),
      endDateTime: values.endDateTime.toISOString(),
      isAllDay: false,
      priority: values.priority,
      location: null,
      notes: values.notes ?? null,
    };

    if (isEditMode) {
      updateEvent.mutate(
        { path: { phaseId: phaseId! }, body },
        {
          onSuccess: () => {
            closeDialog();
          },
        },
      );
    } else {
      createEvent.mutate(
        { body },
        {
          onSuccess: () => {
            closeDialog();
          },
        },
      );
    }
  };

  return (
    <BaseForm
      schema={phaseFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      {(methods) => {
        const { watch } = methods;
        const selectedType = watch("type");

        return (
          <>
            <FormInput
              name="title"
              control={methods.control}
              label="Tên giai đoạn"
              placeholder="VD: Ôn thi cuối kỳ, Đồ án nhóm..."
            />
            {selectedType != "General" && (
              <FormSelect
                name="type"
                control={methods.control}
                label="Loại giai đoạn"
                placeholder="Chọn loại"
                options={PHASE_TYPE_OPTIONS}
              />
            )}
            <FormField
              control={methods.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mức độ ưu tiên</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {PRIORITY_OPTIONS.map((option) => {
                        const isActive = Number(field.value) === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? option.activeClassName
                                : "border-border bg-background text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormDatePicker
              control={methods.control}
              name="startDateTime"
              label="Ngày bắt đầu"
            />
            <FormDatePicker
              control={methods.control}
              name="endDateTime"
              label="Ngày kết thúc"
            />
            <FormInput
              name="notes"
              control={methods.control}
              label="Ghi chú (tùy chọn)"
              placeholder="Mô tả thêm về giai đoạn này..."
            />
            <Button
              type="submit"
              disabled={createEvent.isPending || updateEvent.isPending}
            >
              {isEditMode ? "Cập nhật" : "Tạo giai đoạn"}
            </Button>
          </>
        );
      }}
    </BaseForm>
  );
}
