import { useDialogStore } from "@/stores/useDialogStore";
import TaskFormContainer from "../form-containers/TaskFormContainer";
import RoutineFormContainer from "../form-containers/RoutineFormContainer";
import CourseFormContainer from "../form-containers/CourseFormContainer";
import ScheduleFormContainer from "../form-containers/ScheduleFormContainer";
import LogFormContainer from "../form-containers/LogFormContainer";
import StudyPlanFormContainer from "../form-containers/StudyPlanFormContainer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogDataMap, DialogType } from "@/stores/useDialogStore";
import { cn } from "@/lib/utils";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";
import PlanTemplateEditDialog from "@/components/dialogs/template/PlanTemplateEditDialog";
import PlanTemplateSelectPlanDialog from "@/components/dialogs/template/PlanTemplateSelectPlanDialog";
import EventFormContainer from "../form-containers/EventFormContainer";
import SubjectFormContainer from "../form-containers/SubjectFormContainer";

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
  PLAN_TEMPLATE_EDIT: () => "Chỉnh sửa template",
  PLAN_TEMPLATE_SELECT_PLAN: () => "Tạo template từ kế hoạch",
  EVENT_FORM: (data) => (data.eventId ? "Cập nhật sự kiện" : "Tạo sự kiện mới"),
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
};

const DIALOG_SIZES: { [K in DialogType]: string } = {
  CONFIRM_DELETE: "sm:max-w-sm", // Hộp thoại xác nhận
  STUDY_PLAN_FORM: "sm:max-w-lg", // Form tạo Study Plan vừa vừa (512px)
  TASK_FORM: "sm:max-w-lg", // Form tạo Task vừa vừa (512px)
  COURSE_FORM: "sm:max-w-md", // Form tạo môn học (448px)
  SCHEDULE_FORM: "sm:max-w-md", // Form xếp lịch lẻ
  LOG_WORK_FORM: "sm:max-w-3xl",
  PLAN_TEMPLATE_EDIT: "sm:max-w-lg",
  PLAN_TEMPLATE_SELECT_PLAN: "sm:max-w-lg",
  EVENT_FORM: "sm:max-w-lg", // Form tạo sự kiện (512px)
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
          <ComponentToRender />
        </div>
      </DialogContent>
    </Dialog>
  );
}
