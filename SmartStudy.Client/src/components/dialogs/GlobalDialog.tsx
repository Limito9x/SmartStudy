import { useDialogStore } from "@/stores/useDialogStore";
import TaskFormContainer from "../forms/containers/TaskFormContainer";
import RoutineFormContainer from "../forms/containers/RoutineFormContainer";
import CourseFormContainer from "../forms/containers/CourseFormContainer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogDataMap, DialogType } from "@/stores/useDialogStore";
import { cn } from "@/lib/utils";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";

const DIALOG_TITLES: {
  [K in DialogType]: (data: DialogDataMap[K]) => string;
} = {
  TASK_FORM: (data) => (data.taskId ? "Cập nhật nhiệm vụ" : "Tạo nhiệm vụ mới"),
  ROUTINE_FORM: (data) =>
    data.routineId ? "Cập nhật lịch trình" : "Tạo lịch trình mới",
  COURSE_FORM: (data) =>
    data.courseId ? "Cập nhật khóa học" : "Tạo khóa học mới",
  CONFIRM_DELETE: (data) => `Xác nhận xóa ${data.itemType}`,
};

const DIALOG_COMPONENTS: {
  [K in DialogType]: React.FC;
} = {
  TASK_FORM: TaskFormContainer,
  ROUTINE_FORM: RoutineFormContainer,
  COURSE_FORM: CourseFormContainer,
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
  }
};

const DIALOG_SIZES: { [K in DialogType]: string } = {
  CONFIRM_DELETE: "sm:max-w-sm", // Hộp thoại xác nhận
  TASK_FORM: "sm:max-w-lg", // Form tạo Task vừa vừa (512px)
  COURSE_FORM: "sm:max-w-md", // Form tạo môn học (448px)
//   SCHEDULE_FORM: "sm:max-w-md", // Form xếp lịch lẻ

  // KHÚC ĂN TIỀN LÀ ĐÂY: Form Routine cho to chà bá lên (768px hoặc 896px)
  ROUTINE_FORM: "sm:max-w-3xl lg:max-w-4xl",
};

export default function GlobalDialog() {
  const { isOpen, type, data, closeDialog } = useDialogStore();

  if (!isOpen || !type || !data) return null;

  const getTitle = () => {
    const resolver = DIALOG_TITLES[type] as any;
    return resolver(data);
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
