import { logSchema, type LogFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormInput, FormSelect } from "@/components/form-controls";
import { BaseFormField } from "@/components/form-controls/BaseFormField";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { TaskStatus, TaskType } from "@/services/api";

interface LogWorkFormProps {
  onSubmit: (data: LogFormValues) => void;
  defaultValues?: Partial<LogFormValues>;
  isEditMode: boolean;
  taskStatus: TaskStatus;
  taskType?: TaskType;
}

export function LogWorkForm({
  onSubmit,
  defaultValues,
  isEditMode,
  taskStatus,
  taskType,
}: LogWorkFormProps) {
  const isAlreadyCompleted = taskStatus === "Completed";

  const getNotePlaceholder = (type?: TaskType) => {
    switch (type) {
      case "ClassSession":
        return "Thầy cô có nhấn mạnh phần nào sẽ ra thi không? Có phần nào giảng nhanh quá chưa hiểu rõ?";
      case "SelfStudy":
        return "Hôm nay đã học được được kiến thức gì mới? Còn phần nào đọc tài liệu mãi chưa hiểu?";
      case "AssignmentWork":
        return "Tiến độ bài làm đến đâu rồi? Gặp khó khăn hay vướng mắc nào không?";
      case "Meeting":
        return "Nhóm đã chốt được giải pháp gì? Việc tiếp theo mình phải làm là gì?";
      default:
        return "Ghi lại những điểm quan trọng trong phiên học này...";
    }
  };

  const showComprehension =
    taskType === "ClassSession" || taskType === "SelfStudy";
  const showDifficulty =
    taskType === "ClassSession" ||
    taskType === "SelfStudy" ||
    taskType === "AssignmentWork";

  return (
    <BaseForm
      schema={logSchema}
      defaultValues={{
        markAsCompleted: false,
        ...defaultValues,
      }}
      onSubmit={onSubmit}
    >
      {(methods) => {
        const { control } = methods;
        return (
          <>
            <FormInput
              name="actualDuration"
              control={control}
              label="Thời gian thực tế (phút)"
              placeholder="Ví dụ: 60"
              type="number"
            />
            {showComprehension && (
              <FormSelect
                name="comprehensionLevel"
                control={control}
                label="Mức độ hiểu bài"
                placeholder="Chọn mức độ"
                valueAsNumber
                options={[
                  { value: "3", label: "Hiểu rõ" },
                  { value: "2", label: "Hiểu cơ bản" },
                  { value: "1", label: "Còn mơ hồ" },
                  { value: "0", label: "Chưa hiểu" },
                ]}
              />
            )}
            {showDifficulty && (
              <FormSelect
                name="difficultyLevel"
                control={control}
                label="Độ khó"
                placeholder="Chọn mức độ"
                valueAsNumber
                options={[
                  { value: "2", label: "Khó" },
                  { value: "1", label: "Vừa" },
                  { value: "0", label: "Dễ" },
                ]}
              />
            )}
            <BaseFormField
              control={control}
              name="note"
              label="Ghi chú"
              render={(field) => (
                <Textarea
                  placeholder={getNotePlaceholder(taskType)}
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            {!isAlreadyCompleted ? (
              <BaseFormField
                control={control}
                name="markAsCompleted"
                label=""
                render={(field) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      id="markAsCompleted"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="markAsCompleted" className="cursor-pointer">
                      Đánh dấu hoàn thành sau khi log
                    </Label>
                  </div>
                )}
              />
            ) : (
              <>
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  ✓ Công việc này đã được đánh dấu hoàn thành. Bạn đang thêm
                  lịch sử học tập bổ sung.
                </div>
              </>
            )}
            <Button type="submit" className="w-full">
              {isEditMode
                ? "Cập nhật ghi nhận công việc"
                : "Thêm ghi nhận công việc"}
            </Button>
          </>
        );
      }}
    </BaseForm>
  );
}
