import { routineSchema, type RoutineFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import {
  FormInput,
  FormSelect,
  FormCombobox,
} from "@/components/form-controls";
import { FormDatePicker } from "@/components/form-controls";
import { useCourse } from "@/hooks/entities/useCourse";
import type {
  ResponseCourseDto,
  ResponsePhaseDto,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { useEffect } from "react";

interface RoutineFormProps {
  showCourseField?: boolean;
  showEventField?: boolean;
  isEditMode?: boolean;
  defaultValues?: RoutineFormValues;
  onSubmit: (values: RoutineFormValues) => void;
}

export default function RoutineForm({
  showCourseField = true,
  showEventField = true,
  isEditMode = false,
  defaultValues,
  onSubmit,
}: RoutineFormProps) {
  const { data: courses } = useCourse({
    studyPlanId: undefined,
  }).getCourses;
  return (
    <BaseForm
      schema={routineSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        const { fields, append, remove } = useFieldArray({
          control,
          name: "schedules",
        });

        const selectedCourseId = methods.watch("courseId");
        const { data: events } = useTimelineEvent({
          courseId: Number(selectedCourseId),
        }).getEventsByCourse;

        useEffect(() => {
          if (selectedCourseId) {
            methods.setValue("eventId", Number(events?.[0]?.id));
          }
        }, [selectedCourseId]);

        return (
          <>
            <FormInput
              name="name"
              control={control}
              label="Tên lịch trình"
              placeholder="Nhập tên lịch trình"
            />
            <FormInput
              name="description"
              control={control}
              label="Mô tả"
              placeholder="Nhập mô tả (tùy chọn)"
            />
            <FormSelect
              name="type"
              control={control}
              label="Loại lịch trình"
              options={[
                { label: "Học lớp", value: "ClassSession" },
                { label: "Tự học", value: "SelfStudy" },
                { label: "Bài tập", value: "AssignmentWork" },
                { label: "Họp nhóm", value: "Meeting" },
              ]}
            />
            {showCourseField && (
              <FormCombobox<RoutineFormValues, ResponseCourseDto>
                name="courseId"
                control={control}
                label="Thuộc khóa học"
                placeholder="Chọn khóa học (nếu có)"
                options={courses || []}
                getOptionLabel={(option) => `${option.name}`}
                getOptionValue={(option) => option.id!.toString()}
                valueAsNumber
                emptyText="Không tìm thấy khóa học"
              />
            )}
            {showEventField && selectedCourseId && (
              <FormCombobox<RoutineFormValues, ResponsePhaseDto>
                name="eventId"
                control={control}
                label="Thuộc giai đoạn"
                placeholder="Chọn giai đoạn"
                options={events || []}
                getOptionLabel={(option) => `${option.title}`}
                getOptionValue={(option) => option.id!.toString()}
                valueAsNumber
                emptyText={"Không tìm thấy sự kiện nào thuộc khóa học đã chọn"}
              />
            )}
            <div className="flex items-center">
              <FormDatePicker
                name="startDate"
                control={control}
                label="Ngày bắt đầu"
                placeholder="Chọn ngày bắt đầu"
              />

              <span className="mx-4 text-gray-500">|</span>

              <FormDatePicker
                name="endDate"
                control={control}
                label="Ngày kết thúc"
                placeholder="Chọn ngày kết thúc"
              />
            </div>
            {/* Hiện ghi chú nếu user CÓ chọn khóa học nhưng KHÔNG chọn ngày */}
            {selectedCourseId && (
              <p className="text-xs text-blue-600 italic mt-1">
                💡 Bỏ trống ngày nếu lịch trình này kéo dài suốt khóa học.
              </p>
            )}

            {/* --- KHU VỰC 2: CÁC CA HỌC (SCHEDULES) VỚI FIELD ARRAY --- */}
            <div className="pt-4 mt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700">
                  CÁC CA HỌC TRONG TUẦN
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  // 3. HÀM APPEND: Bơm 1 object trắng vào mảng khi bấm nút Thêm
                  onClick={() =>
                    append({
                      id: 0,
                      dayOfWeek: 2, // Mặc định thứ 2
                      startTime: "07:30",
                      duration: 90,
                      location: "",
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm ca học
                </Button>
              </div>

              {/* 4. VÒNG LẶP RENDER CÁC CA HỌC */}
              <div className="space-y-3">
                {fields.length === 0 && (
                  <div>
                    <p className="text-xs text-center text-gray-400 italic py-4 bg-gray-50 rounded-md">
                      Chưa có ca học nào.
                    </p>
                    <p className="text-xs text-blue-600 italic mt-1">
                      💡 Có thể để trống và sắp xếp lịch sau thông qua giao diện
                      "Lịch trình"
                    </p>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative p-4 border border-gray-200 rounded-lg bg-gray-50 "
                  >
                    {/* Nút xóa Ca học */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-100 hover:text-red-700 h-8 w-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="pr-10 grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* QUAN TRỌNG: Cú pháp name={`schedules.${index}.truong_du_lieu`} */}

                      <FormSelect
                        name={`schedules.${index}.dayOfWeek`}
                        control={control}
                        label="Thứ"
                        options={[
                          { label: "Thứ 2", value: "1" },
                          { label: "Thứ 3", value: "2" },
                          { label: "Thứ 4", value: "3" },
                          { label: "Thứ 5", value: "4" },
                          { label: "Thứ 6", value: "5" },
                          { label: "Thứ 7", value: "6" },
                          { label: "Chủ nhật", value: "0" },
                        ]}
                      />

                      <FormInput
                        name={`schedules.${index}.startTime`}
                        control={control}
                        label="Giờ bắt đầu"
                        type="time" // Dùng type time cho lẹ
                      />

                      <FormInput
                        name={`schedules.${index}.duration`}
                        control={control}
                        label="Thời lượng (phút)"
                        type="number"
                      />

                      <FormInput
                        name={`schedules.${index}.location`}
                        control={control}
                        label="Phòng học"
                        placeholder="VD: Phòng 302"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="mt-4">
              {isEditMode ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        );
      }}
    />
  );
}
