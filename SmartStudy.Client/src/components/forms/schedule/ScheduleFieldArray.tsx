import { useEffect } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldArray,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { FormInput, FormSelect } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  defaultScheduleItemValues,
  type ScheduleItemFormInput,
  type ScheduleItemFormValues,
} from "./schema";

const dayOfWeekOptions = [
  { label: "Thứ 2", value: "1" },
  { label: "Thứ 3", value: "2" },
  { label: "Thứ 4", value: "3" },
  { label: "Thứ 5", value: "4" },
  { label: "Thứ 6", value: "5" },
  { label: "Thứ 7", value: "6" },
  { label: "Chủ nhật", value: "0" },
];

const durationUnitOptions = [
  { label: "Phút", value: "Minutes" },
  { label: "Giờ", value: "Hours" },
  { label: "Tiết", value: "Periods" },
];

interface SchedulesFieldArrayProps<
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TFieldArrayName;
  label?: string;
  description?: string;
  addButtonText?: string;
  emptyItem?: ScheduleItemFormInput;
  minItems?: number;
  className?: string;
  onItemsChange?: (items: ScheduleItemFormValues[] | null | undefined) => void;
}

export function SchedulesFieldArray<
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
>({
  control,
  name,
  label = "Lịch học",
  description = "Thêm các khung giờ, thời lượng và địa điểm cho hoạt động này.",
  addButtonText = "Thêm khung giờ",
  emptyItem = defaultScheduleItemValues,
  minItems = 0,
  className,
  onItemsChange,
}: SchedulesFieldArrayProps<TFieldValues, TFieldArrayName>) {
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    TFieldArrayName
  >({
    control,
    name,
  });

  const items = useWatch({
    control: control as Control<FieldValues>,
    name: name as string,
  }) as ScheduleItemFormValues[] | null | undefined;

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  const handleAppend = () => {
    append({ ...emptyItem } as FieldArray<TFieldValues, TFieldArrayName>);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleAppend}>
          {addButtonText}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-sm">
          Chưa có khung giờ nào. Nhấn "{addButtonText}" để thêm lịch.
        </div>
      ) : (
        fields.map((field, index) => {
          const itemName = `${name}.${index}`;
          const canRemove = fields.length > minItems;

          return (
            <Card key={field.id} className="gap-4 py-4">
              <CardHeader className="px-4 md:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      Khung giờ {index + 1}
                    </CardTitle>
                    <CardDescription>
                      Cấu hình thứ, giờ bắt đầu, thời lượng và địa điểm.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!canRemove}
                    onClick={() => remove(index)}
                  >
                    Xóa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-4 md:px-6 md:grid-cols-2 xl:grid-cols-5">
                <FormSelect
                  control={control}
                  name={`${itemName}.dayOfWeek` as FieldPath<TFieldValues>}
                  label="Thứ"
                  options={dayOfWeekOptions}
                  valueAsNumber
                />
                <FormInput
                  control={control}
                  name={`${itemName}.startTime` as FieldPath<TFieldValues>}
                  label="Giờ bắt đầu"
                  type="time"
                />
                <FormInput
                  control={control}
                  name={`${itemName}.duration` as FieldPath<TFieldValues>}
                  label="Thời lượng"
                  type="number"
                />
                {/* <FormSelect
                  control={control}
                  name={`${itemName}.durationUnit` as FieldPath<TFieldValues>}
                  label="Đơn vị"
                  options={durationUnitOptions}
                /> */}
                <FormInput
                  control={control}
                  name={`${itemName}.location` as FieldPath<TFieldValues>}
                  label="Địa điểm"
                  placeholder="Phòng A203, thư viện..."
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

export default SchedulesFieldArray;
