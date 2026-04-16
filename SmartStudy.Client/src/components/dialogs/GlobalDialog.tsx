import { useDialogStore } from "@/stores/useDialogStore";
import { lazy } from "react";

const TaskFormContainer = lazy(
  () => import("../form-containers/TaskFormContainer"),
);
const RoutineFormContainer = lazy(
  () => import("../form-containers/RoutineFormContainer"),
);
const CourseFormContainer = lazy(
  () => import("../form-containers/CourseFormContainer"),
);
const ScheduleFormContainer = lazy(
  () => import("../form-containers/ScheduleFormContainer"),
);
const LogFormContainer = lazy(
  () => import("../form-containers/LogFormContainer"),
);
const StudyPlanFormContainer = lazy(
  () => import("../form-containers/StudyPlanFormContainer"),
);
const ConfirmDelete = lazy(
  () => import("@/components/ui/common/ConfirmDelete"),
);
const ConfirmAction = lazy(
  () => import("@/components/ui/common/ConfirmAction"),
);
const PlanTemplateEditDialog = lazy(
  () => import("@/components/dialogs/template/PlanTemplateEditDialog"),
);
const PlanTemplateSelectPlanDialog = lazy(
  () => import("@/components/dialogs/template/PlanTemplateSelectPlanDialog"),
);
const EventFormContainer = lazy(
  () => import("../form-containers/EventFormContainer"),
);
const SubjectFormContainer = lazy(
  () => import("../form-containers/SubjectFormContainer"),
);
const PhaseFormContainer = lazy(
  () => import("../form-containers/PhaseFormContainer"),
);

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogDataMap, DialogType } from "@/stores/useDialogStore";
import { cn } from "@/lib/utils";

const DIALOG_TITLES: {
  [K in DialogType]: (data: DialogDataMap[K]) => string;
} = {
  SUBJECT_FORM: (data) =>
    data.subjectId ? "Cập nhật môn học" : "Tạo môn học mới",
  STUDY_PLAN_FORM: (data) =>
    data.studyPlanId ? "Cập nhật kế hoạch học tập" : "Tạo kế hoạch học tập mới",
  TASK_FORM: (data) => (data.taskId ? "Cập nhật nhiệm vụ" : "Tạo nhiệm vụ mới"),
  ROUTINE_FORM: (data) =>
    data.routineId ? "Cập nhật lịch trình" : "Tạo lịch trình mới",
  COURSE_FORM: (data) =>
    data.courseId ? "Cập nhật khóa học" : "Tạo khóa học mới",
  SCHEDULE_FORM: () => "Tạo lịch học mới",
  LOG_WORK_FORM: (data) =>
    data.logId ? "Cập nhật nhật ký làm việc" : "Tạo nhật ký làm việc mới",
  CONFIRM_DELETE: (data) => `Xác nhận xóa ${data.itemType}`,
  CONFIRM_ACTION: (data) => data.title,
  PLAN_TEMPLATE_EDIT: () => "Chỉnh sửa template",
  PLAN_TEMPLATE_SELECT_PLAN: () => "Tạo template từ kế hoạch",
  EVENT_FORM: (data) => (data.eventId ? "Cập nhật sự kiện" : "Tạo sự kiện mới"),
  PHASE_FORM: (data) =>
    data.phaseId ? "Cập nhật giai đoạn" : "Thêm giai đoạn mới",
};

const DIALOG_COMPONENTS: {
  [K in DialogType]: React.FC;
} = {
  STUDY_PLAN_FORM: StudyPlanFormContainer,
  SUBJECT_FORM: SubjectFormContainer,
  TASK_FORM: TaskFormContainer,
  ROUTINE_FORM: RoutineFormContainer,
  COURSE_FORM: CourseFormContainer,
  EVENT_FORM: EventFormContainer,
  PHASE_FORM: PhaseFormContainer,
  SCHEDULE_FORM: ScheduleFormContainer,
  LOG_WORK_FORM: LogFormContainer,
  PLAN_TEMPLATE_EDIT: PlanTemplateEditDialog,
  PLAN_TEMPLATE_SELECT_PLAN: PlanTemplateSelectPlanDialog,
  CONFIRM_DELETE: () => {
    const { data, closeDialog } = useDialogStore();
    const { itemType, itemName, onConfirm } =
      data as DialogDataMap["CONFIRM_DELETE"];

    return (
      <ConfirmDelete
        message={`Bạn có chắc chắn muốn xóa ${itemType} "${itemName}" không? Hành động này không thể hoàn tác.`}
        onConfirm={() => {
          onConfirm();
          closeDialog();
        }}
        onCancel={closeDialog}
      />
    );
  },
  CONFIRM_ACTION: () => {
    const { data, closeDialog } = useDialogStore();
    const { message, onConfirm, confirmLabel, cancelLabel, destructive } =
      data as DialogDataMap["CONFIRM_ACTION"];

    return (
      <ConfirmAction
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        destructive={destructive}
        onConfirm={() => {
          onConfirm();
          closeDialog();
        }}
        onCancel={closeDialog}
      />
    );
  },
};

const DIALOG_SIZES: { [K in DialogType]: string } = {
  CONFIRM_DELETE: "sm:max-w-sm", // Hộp thoại xác nhận
  CONFIRM_ACTION: "sm:max-w-sm", // Hộp thoại xác nhận chung
  STUDY_PLAN_FORM: "sm:max-w-lg", // Form tạo Study Plan vừa vừa (512px)
  TASK_FORM: "sm:max-w-lg", // Form tạo Task vừa vừa (512px)
  COURSE_FORM: "sm:max-w-md", // Form tạo môn học (448px)
  SCHEDULE_FORM: "sm:max-w-md", // Form xếp lịch lẻ
  LOG_WORK_FORM: "sm:max-w-3xl",
  PLAN_TEMPLATE_EDIT: "sm:max-w-lg",
  PLAN_TEMPLATE_SELECT_PLAN: "sm:max-w-lg",
  EVENT_FORM: "sm:max-w-lg", // Form tạo sự kiện (512px)
  PHASE_FORM: "sm:max-w-lg", // Form tạo giai đoạn (512px)
  SUBJECT_FORM: "sm:max-w-md", // Form tạo môn học (448px)
  ROUTINE_FORM: "sm:max-w-3xl lg:max-w-4xl",
};

export default function GlobalDialog() {
  const { isOpen, type, data, closeDialog } = useDialogStore();

  if (!isOpen || !type || !data) return null;

  const getTitle = () => {
    return DIALOG_TITLES[type](data as never);
  };

  const ComponentToRender = DIALOG_COMPONENTS[type];

  const maxWidthClass = DIALOG_SIZES[type] || "sm:max-w-lg"; // Mặc định nếu chưa định nghĩa

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        className={cn(
          "overflow-y-auto max-h-[90vh] transition-all duration-200",
          maxWidthClass, // Gắn cái width linh động vào đây
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <ComponentToRender />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
