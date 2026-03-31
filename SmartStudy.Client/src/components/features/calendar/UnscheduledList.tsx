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
import { useMemo, useState } from "react";

interface UnscheduledListProps {
  inboxItems: InboxResponseDto | undefined;
  onDragStart: (item: UnscheduledItemDto) => void;
  onDragEnd: () => void;
  onDelete: (item: UnscheduledItemDto) => void;
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

export default function UnscheduledList({
  inboxItems,
  onDragStart,
  onDragEnd,
  onDelete,
}: UnscheduledListProps) {
  const [activeTab, setActiveTab] = useState<"task" | "routine">("task");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(ALL_COURSES);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const taskItems = useMemo(
    () => inboxItems?.floatingTasks ?? [],
    [inboxItems?.floatingTasks],
  );

  const routineItems = useMemo(
    () => inboxItems?.fixedRoutines ?? [],
    [inboxItems?.fixedRoutines],
  );

  const courseOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();

    [...taskItems, ...routineItems].forEach((item) => {
      const courseId = item.courseId;
      const courseName = item.courseName?.trim();

      if (courseId === null || courseId === undefined || !courseName) {
        return;
      }

      const key = String(courseId);
      if (!map.has(key)) {
        map.set(key, { id: key, name: courseName });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [routineItems, taskItems]);

  const applyFilters = (items: UnscheduledItemDto[]) => {
    return items.filter((item) => {
      const matchesName =
        !normalizedKeyword ||
        item.name?.toLowerCase().includes(normalizedKeyword);

      const matchesCourse =
        selectedCourseId === ALL_COURSES ||
        String(item.courseId ?? "") === selectedCourseId;

      return Boolean(matchesName && matchesCourse);
    });
  };

  const filteredTaskItems = useMemo(() => {
    return applyFilters(taskItems);
  }, [normalizedKeyword, selectedCourseId, taskItems]);

  const filteredRoutineItems = useMemo(() => {
    return applyFilters(routineItems);
  }, [normalizedKeyword, selectedCourseId, routineItems]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: UnscheduledItemDto,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    onDragStart(item);
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

  const renderItemList = (
    items: UnscheduledItemDto[],
    emptyMessage: string,
  ) => {
    if (items.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic p-4 text-center">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 p-1">
        {items.map((item) => (
          <div key={item.id} className="relative flex">
            <div
              draggable={true}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={onDragEnd}
              className="group flex-1 flex flex-col p-3 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 wrap-break-word leading-5">
                    {item.name}
                  </div>
                  {renderCourseMeta(item)}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="mt-0.5 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  title="Xóa mục này"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            {courseOptions.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
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
            Task lẻ ({taskItems.length})
          </TabsTrigger>
          <TabsTrigger value="routine" className="flex-1">
            Routine ({routineItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="task" className="mt-2 overflow-y-auto">
          {renderItemList(
            filteredTaskItems,
            normalizedKeyword || selectedCourseId !== ALL_COURSES
              ? "Không tìm thấy task phù hợp"
              : "Không có task lẻ nào chưa được lên lịch",
          )}
        </TabsContent>

        <TabsContent value="routine" className="mt-2 overflow-y-auto">
          {renderItemList(
            filteredRoutineItems,
            normalizedKeyword || selectedCourseId !== ALL_COURSES
              ? "Không tìm thấy routine phù hợp"
              : "Không có routine nào chưa được lên lịch",
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
