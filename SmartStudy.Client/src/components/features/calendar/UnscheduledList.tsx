import type { UnscheduledItemDto, InboxResponseDto } from "@/services/api";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useRef, useState } from "react";
import { Draggable } from "@fullcalendar/interaction/index.js";
import { useLayoutStore } from "@/stores/useLayoutStore";
import UnscheduledItemCard from "./UnscheduledItemCard";

interface UnscheduledListProps {
  inboxItems: InboxResponseDto | undefined;
}

const ALL_COURSES = "all";

const hexToRgba = (hexColor: string, alpha: number) => {
  const normalized = hexColor.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return undefined;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCourseStyles = (courseColor?: string | null) => {
  if (!courseColor) {
    return {
      dotColor: "#9ca3af",
      badgeStyle: undefined,
    };
  }

  const lightBackground = hexToRgba(courseColor, 0.14);
  const borderColor = hexToRgba(courseColor, 0.35);

  if (!lightBackground || !borderColor) {
    return {
      dotColor: "#9ca3af",
      badgeStyle: undefined,
    };
  }

  return {
    dotColor: courseColor,
    badgeStyle: {
      backgroundColor: lightBackground,
      color: courseColor,
      borderColor,
    },
  };
};

const renderCourseMeta = (item: UnscheduledItemDto) => {
  if (!item.courseName) {
    return (
      <div className="text-xs text-gray-500 italic mt-1">Chưa phân loại</div>
    );
  }

  const courseStyle = getCourseStyles(item.courseColor);

  return (
    <Badge
      className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none"
      style={courseStyle.badgeStyle}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: courseStyle.dotColor }}
      />
      {item.courseName}
    </Badge>
  );
};

interface DraggableItemListProps {
  items: Record<string, UnscheduledItemDto[]>; // Nhóm theo courseId (string vì có thể là "no_course")
  emptyMessage: string;
}

function DraggableItemList({ items, emptyMessage }: DraggableItemListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let draggable: Draggable | null = null;
    if (containerRef.current) {
      draggable = new Draggable(containerRef.current, {
        itemSelector: ".inbox-item",
        eventData: (eventEl) => {
          useLayoutStore.getState().setInboxOpen(false); // Đóng inbox khi bắt đầu kéo

          // Lắng nghe sự kiện nhả chuột ở cấp toàn cục (Global) để mở lại Drawer
          const handleDropOrCancel = () => {
            // Dùng setTimeout chạy ngầm để Calendar xử lý drop nếu có drop thành công
            setTimeout(() => {
              useLayoutStore.getState().setInboxOpen(true);
            }, 100);
            window.removeEventListener("mouseup", handleDropOrCancel);
            window.removeEventListener("pointerup", handleDropOrCancel);
            window.removeEventListener("touchend", handleDropOrCancel);
          };

          window.addEventListener("mouseup", handleDropOrCancel);
          window.addEventListener("pointerup", handleDropOrCancel);
          window.addEventListener("touchend", handleDropOrCancel);

          return JSON.parse(
            eventEl.getAttribute("data-event") || "{}",
          ) as UnscheduledItemDto;
        },
      });
    }

    return () => {
      draggable?.destroy(); // Clean up instance when unmounting
    };
  }, [items]);

  if (Object.keys(items).length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2" ref={containerRef}>
      {Object.entries(items).map(([courseId, itemList]) => {
        // Lấy thông tin môn học từ item đầu tiên trong list
        const firstItem = itemList[0];
        const courseName = firstItem?.courseName || "Chưa phân loại";
        const courseColor = firstItem?.courseColor || "#94a3b8"; // Màu mặc định nếu không có

        return (
          <div key={courseId} className="group/course flex flex-col gap-2">
            {/* HEADER CỦA NHÓM: Sticky và có màu sắc nhẹ nhàng */}
            <div className="flex items-center gap-2 px-1 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: courseColor }}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {courseName}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
              {/* Đường kẻ ngang mờ */}
            </div>

            {/* LIST ITEMS: Có gạch dọc chạy bên cạnh */}
            <div
              className="flex flex-col gap-3 ml-1.5 pl-4 border-l-2 transition-colors"
              style={{ borderLeftColor: `${courseColor}40` }} // 40 là độ mờ (alpha) 25% cho đường kẻ dọc
            >
              {itemList.map((item) => (
                <div
                  key={item.id}
                  className="inbox-item"
                  data-event={JSON.stringify({
                    id: item.id,
                    title: item.name,
                    backgroundColor: item.courseColor || "#94a3b8",
                    duration: { minutes: item.plannedDuration || 60 },
                    ...item,
                  })}
                >
                  <UnscheduledItemCard
                    item={item}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UnscheduledList({ inboxItems }: UnscheduledListProps) {
  const [activeTab, setActiveTab] = useState<"task" | "routine">("task");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(ALL_COURSES);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const groupedTasks = useMemo(() => {
    if (!inboxItems?.floatingTasks) return {};

    return inboxItems.floatingTasks.reduce(
      (acc: Record<string, UnscheduledItemDto[]>, task) => {
        const courseId = task.courseId?.toString() ?? "no_course";
        if (!acc[courseId]) {
          acc[courseId] = [];
        }
        acc[courseId].push(task);
        return acc;
      },
      {},
    );
  }, [inboxItems?.floatingTasks]);

  const groupedRoutines = useMemo(() => {
    if (!inboxItems?.fixedRoutines) return {};

    return inboxItems.fixedRoutines.reduce(
      (acc: Record<string, UnscheduledItemDto[]>, routine) => {
        const courseId = routine.courseId?.toString() ?? "no_course";
        if (!acc[courseId]) {
          acc[courseId] = [];
        }
        acc[courseId].push(routine);
        return acc;
      },
      {},
    );
  }, [inboxItems?.fixedRoutines]);

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="grid grid-cols-1 gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm theo tên công việc"
            className="pl-9"
          />
        </div>

        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Lọc theo môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_COURSES}>Tất cả môn học</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "task" | "routine")}
        className="flex-1 min-h-0"
      >
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="task" className="flex-1">
            Task lẻ (
            {Object.values(groupedTasks).reduce(
              (sum, arr) => sum + arr.length,
              0,
            )}
            )
          </TabsTrigger>
          <TabsTrigger value="routine" className="flex-1">
            Routine (
            {Object.values(groupedRoutines).reduce(
              (sum, arr) => sum + arr.length,
              0,
            )}
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="task" className="mt-2 overflow-y-auto">
          <DraggableItemList
            items={groupedTasks}
            emptyMessage={
              normalizedKeyword || selectedCourseId !== ALL_COURSES
                ? "Không tìm thấy task phù hợp"
                : "Không có task nào chưa được lên lịch"
            }
          />
        </TabsContent>

        <TabsContent value="routine" className="mt-2 overflow-y-auto">
          <DraggableItemList
            items={groupedRoutines}
            emptyMessage={
              normalizedKeyword || selectedCourseId !== ALL_COURSES
                ? "Không tìm thấy routine phù hợp"
                : "Không có routine nào chưa được lên lịch"
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
