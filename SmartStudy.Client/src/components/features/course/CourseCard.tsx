import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ArrowRight } from "lucide-react";
import type { ResponseCourseDto } from "@/services/api";

interface CourseCardProps {
  course: ResponseCourseDto;
  onEdit: (course: ResponseCourseDto) => void;
  onDelete: (course: ResponseCourseDto) => void;
  onView: (course: ResponseCourseDto) => void;
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  onView,
}: CourseCardProps) {
  // Đảm bảo không bị lỗi nếu DB đang thiếu màu
  const courseColor = course.color || "#9ca3af";

  return (
    <Card
      // 1. Thêm overflow-hidden để vạch màu kẹp gọn bên trong viền bo tròn
      className="group relative flex flex-col hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* 2. KHÚC ĂN TIỀN: VẠCH KẺ MÀU ĐỘNG */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: courseColor }}
      />

      {/* More menu — góc trên phải */}
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(course)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(course)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xoá
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3. Thêm pl-5 để lùi chữ vào, tránh đè lên vạch màu */}
      <CardHeader className="pb-2 pr-10 pl-5">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-semibold text-base leading-tight">
            {course.name}
          </span>
        </div>
      </CardHeader>

      <CardFooter className="pt-2 border-t pl-5">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-muted-foreground hover:text-primary gap-1"
          onClick={() => onView(course)}
        >
          Xem chi tiết
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
