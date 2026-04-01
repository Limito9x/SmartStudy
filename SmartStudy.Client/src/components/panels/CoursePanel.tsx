import { ChatContainer } from "@/components/chats/ChatContainer";
import TaskDetail from "@/components/features/task/TaskDetail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { PanelDataMap } from "@/stores/usePanelStore";
import { usePanelStore } from "@/stores/usePanelStore";
import { X } from "lucide-react";

interface CoursePanelProps {
  mode: "inline" | "sheet";
  fallbackCourseId?: number;
}

export default function CoursePanel({
  mode,
  fallbackCourseId,
}: CoursePanelProps) {
  const { isOpen, type, data, closePanel } = usePanelStore();

  if (mode === "sheet") {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePanel();
          }
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-dvh max-h-dvh w-full rounded-none p-0 sm:max-w-none"
        >
          {isOpen && type ? (
            <PanelBody
              type={type}
              data={data}
              fallbackCourseId={fallbackCourseId}
              onClose={closePanel}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    );
  }

  if (!isOpen || !type) {
    return null;
  }

  return (
    <PanelBody
      type={type}
      data={data}
      fallbackCourseId={fallbackCourseId}
      onClose={closePanel}
    />
  );
}

function PanelBody({
  type,
  data,
  fallbackCourseId,
  onClose,
}: {
  type: "CHAT" | "TASK_DETAIL";
  data: PanelDataMap[keyof PanelDataMap] | null;
  fallbackCourseId?: number;
  onClose: () => void;
}) {
  const title = type === "CHAT" ? "AI chat" : "Chi tiết công việc";
  const taskId = (data as PanelDataMap["TASK_DETAIL"] | null)?.taskId;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Đóng panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {type === "CHAT" ? (
          <ChatContainer
            courseId={
              (data as PanelDataMap["CHAT"] | null)?.courseId ??
              fallbackCourseId ??
              null
            }
          />
        ) : taskId ? (
          <TaskDetail taskId={taskId} />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Không có công việc để hiển thị.
          </p>
        )}
      </div>
    </div>
  );
}
