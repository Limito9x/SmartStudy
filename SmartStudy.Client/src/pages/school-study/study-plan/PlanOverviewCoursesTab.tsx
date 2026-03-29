import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResponseCourseDto } from "@/services/api";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

interface PlanOverviewCoursesTabProps {
  courses?: ResponseCourseDto[];
  isLoading: boolean;
  hasError: boolean;
  onAddCourse: () => void;
  onEditCourse: (course: ResponseCourseDto) => void;
  onDeleteCourse: (course: ResponseCourseDto) => void;
  onViewCourse: (course: ResponseCourseDto) => void;
}

const toNumber = (value?: number | string | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCourseSubtitle = (course: ResponseCourseDto) => {
  const score = course.targetScore ? `Mục tiêu ${course.targetScore}` : null;
  const final = course.finalScore ? `Tổng kết ${course.finalScore}` : null;
  return (
    [score, final].filter(Boolean).join(" - ") || "Chưa cập nhật thông tin"
  );
};

function CourseRow({
  course,
  onView,
  onEdit,
  onDelete,
}: {
  course: ResponseCourseDto;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = String(course.name || "KH")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const progress = Math.min(100, Math.max(0, toNumber(course.progress)));

  return (
    <div className="flex items-center gap-3 border-t px-2 py-3 first:border-t-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
        {initials || "KH"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {course.name || "Không tên"}
        </p>
        <p className="truncate text-xs text-slate-500">
          {getCourseSubtitle(course)}
        </p>
      </div>

      <div className="hidden min-w-45 items-center gap-2 sm:flex">
        <Progress value={progress} className="h-1.5 bg-slate-200" />
        <span className="w-10 text-right text-xs font-semibold text-slate-700">
          {progress}%
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onView}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function PlanOverviewCoursesTab({
  courses,
  isLoading,
  hasError,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
}: PlanOverviewCoursesTabProps) {
  return (
    <div className="px-4 py-3 sm:px-6">
      <div className="mb-3 flex justify-end">
        <Button variant="outline" onClick={onAddCourse}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm khóa học
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : hasError ? (
        <p className="py-6 text-sm text-destructive">
          Không thể tải danh sách khóa học.
        </p>
      ) : courses && courses.length > 0 ? (
        <div className="rounded-md border">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onEdit={() => onEditCourse(course)}
              onDelete={() => onDeleteCourse(course)}
              onView={() => onViewCourse(course)}
            />
          ))}
        </div>
      ) : (
        <p className="py-6 text-sm text-slate-500">
          Chưa có khóa học nào trong kế hoạch học tập này.
        </p>
      )}
    </div>
  );
}
