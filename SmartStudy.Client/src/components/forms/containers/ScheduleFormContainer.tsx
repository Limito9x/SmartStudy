import { useSchedule } from "@/hooks/entities/useSchedule"; // File useschedule.ts của bác
import ScheduleForm from "../schedule/ScheduleForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { ScheduleFormValues } from "../schedule/schema";
import { scheduleApiMapper } from "@/utils/mapper.ts/apiMapper";

export default function ScheduleFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { routineId, defaultValues } = data as DialogDataMap["SCHEDULE_FORM"];

  const { createSchedule, updateSchedule } = useSchedule();

  const isEditMode = Number(defaultValues?.id) > 0;

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues = {
    ...defaultValues,
    location: defaultValues?.location || "",
    duration: 60,
  };

  const handleSubmit = (values: ScheduleFormValues) => {
    const payload = {
      dayOfWeek: Number(values.dayOfWeek ?? defaultValues?.dayOfWeek ?? 0),
      startTime: values.startTime,
      duration: values.duration,
      location: values.location || null,
    };

    if (isEditMode) {
      updateSchedule.mutate(
        {
          path: {
            id: Number(defaultValues?.id),
          },
          body: payload,
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
      return;
    }

    createSchedule.mutate(
      {
        body: scheduleApiMapper.toRequestScheduleDto(
          {
            ...values,
            dayOfWeek: payload.dayOfWeek,
          },
          Number(routineId),
        ),
      },
      {
        onSuccess: () => closeDialog(),
      },
    );
  };

  return (
    <ScheduleForm defaultValues={finalDefaultValues} onSubmit={handleSubmit} />
  );
}
