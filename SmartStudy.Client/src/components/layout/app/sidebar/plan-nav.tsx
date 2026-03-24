import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Presentation, BookOpen, Plus } from "lucide-react";
import type { ResponseCourseDto, StudyPlanType } from "@/services/api";
import { useDialogStore } from "@/stores/useDialogStore";

interface PlanNavProps {
  planId: number | null;
  type: StudyPlanType;
  courses: ResponseCourseDto[] | undefined;
  isLoadingCourses: boolean;
}

export default function PlanNav({
  planId,
  courses,
  isLoadingCourses,
  type
}: PlanNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openDialog } = useDialogStore();

  return (
    <SidebarMenuItem>
      {/* Thẻ Cha: Bấm vào ra trang Tổng Quan */}
      <SidebarMenuButton
        asChild
        isActive={location.pathname === `/app/study-plans/${planId}`}
        onClick={() => navigate(`/app/study-plans/${planId}`)}
        className="cursor-pointer font-semibold mt-1"
      >
        <div>
          <Presentation className="w-4 h-4 mr-2" />
          Tổng quan
        </div>
      </SidebarMenuButton>

      <SidebarMenuSub>
        {isLoadingCourses ? (
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>Đang tải môn học...</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ) : courses?.length === 0 ? (
          <SidebarMenuSubItem>
            <SidebarMenuSubButton className="text-gray-400">
              Chưa có môn học
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ) : (
          courses?.map((course) => {
            const coursePath = `/app/study-plans/${planId}/courses/${course.id}`;
            const isActive = location.pathname === coursePath;

            return (
              <SidebarMenuSubItem key={course.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActive}
                  onClick={() => navigate(coursePath)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center w-full min-w-0">
                    <BookOpen className="w-3.5 h-3.5 mr-2 text-gray-500" />
                    <span className="truncate">{course.name}</span>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })
        )}
        <SidebarMenuSubItem>
          <SidebarMenuSubButton
            asChild
            className="text-muted-foreground hover:text-primary mt-1"
            onClick={() =>
              openDialog("COURSE_FORM", {
                studyPlanId: Number(planId),
                type
              })
            }
          >
            <div className="cursor-pointer">
              <Plus className="w-3.5 h-3.5 mr-2" />
              <span>Thêm môn học</span>
            </div>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
}
