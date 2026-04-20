import { BaseForm } from "@/components/forms/base/BaseForm";
import {
  FormDateTimePicker,
  FormInput,
  FormSelect,
} from "@/components/form-controls";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  phasePreviewFormSchema,
  type PhasePreviewFormValues,
  type PhasePreviewSuggestedTask,
  type PhasePreviewSuggestedRoutine,
} from "./schema";

interface PhasePreviewFormProps {
  defaultValues: PhasePreviewFormValues;
  suggestedTasks: PhasePreviewSuggestedTask[];
  suggestedRoutines: PhasePreviewSuggestedRoutine[];
  isSubmitting: boolean;
  onSubmit: (values: PhasePreviewFormValues) => void | Promise<void>;
}

const PHASE_TYPE_OPTIONS = [
  { label: "Tổng quan", value: "General" },
  { label: "Ôn thi", value: "ExamPrep" },
  { label: "Dự án", value: "Project" },
  { label: "Bài tập", value: "Assignment" },
  { label: "Tùy chỉnh", value: "Custom" },
];

const PRIORITY_OPTIONS = [
  { label: "Thấp", value: "1" },
  { label: "Vừa", value: "2" },
  { label: "Cao", value: "3" },
];

export default function PhasePreviewForm({
  defaultValues,
  suggestedTasks,
  suggestedRoutines,
  isSubmitting,
  onSubmit,
}: PhasePreviewFormProps) {
  return (
    <BaseForm
      schema={phasePreviewFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      {(methods) => (
        <>
          <FormInput
            name="title"
            control={methods.control}
            label="Tên giai đoạn"
            placeholder="VD: Phase tăng tốc 2 tuần"
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormSelect
              name="type"
              control={methods.control}
              label="Loại giai đoạn"
              placeholder="Chọn loại"
              options={PHASE_TYPE_OPTIONS}
            />
            <FormSelect
              name="priority"
              control={methods.control}
              label="Mức ưu tiên"
              placeholder="Chọn mức"
              options={PRIORITY_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormDateTimePicker
              control={methods.control}
              name="startDateTime"
              label="Bắt đầu"
            />
            <FormDateTimePicker
              control={methods.control}
              name="endDateTime"
              label="Kết thúc"
            />
          </div>
          <FormInput
            name="notes"
            control={methods.control}
            label="Ghi chú"
            placeholder="Mục tiêu chính cho phase này"
          />

          <div className="rounded-md border bg-slate-50 p-3">
            <p className="text-sm font-semibold">Áp dụng từ preview</p>
            <div className="mt-2 space-y-2">
              <FormField
                control={methods.control}
                name="applyTasks"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border bg-white p-2">
                    <FormLabel className="m-0 text-sm">
                      Tạo luôn task gợi ý ({suggestedTasks.length})
                    </FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={Boolean(field.value)}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="applyRoutines"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border bg-white p-2">
                    <FormLabel className="m-0 text-sm">
                      Tạo luôn routine gợi ý ({suggestedRoutines.length})
                    </FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={Boolean(field.value)}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">Task gợi ý</p>
            {suggestedTasks.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Không có task gợi ý.
              </p>
            )}
            {suggestedTasks.map((task, index) => (
              <div
                key={`${task.name}-${index}`}
                className="rounded-md border p-2 text-xs"
              >
                <p className="font-medium">{task.name}</p>
                <p className="text-muted-foreground">
                  {task.type}{" "}
                  {task.startDateTime ? `- ${task.startDateTime}` : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">Routine gợi ý</p>
            {suggestedRoutines.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Không có routine gợi ý.
              </p>
            )}
            {suggestedRoutines.map((routine, index) => (
              <div
                key={`${routine.name}-${index}`}
                className="rounded-md border p-2 text-xs"
              >
                <p className="font-medium">{routine.name}</p>
                <p className="text-muted-foreground">{routine.type}</p>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo phase từ preview"}
          </Button>
        </>
      )}
    </BaseForm>
  );
}
