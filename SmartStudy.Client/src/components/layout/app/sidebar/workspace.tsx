import { useEffect, useMemo } from "react";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
// Bác check lại xem import hook Course của bác đúng đường dẫn này không nhé:
import { useCourse } from "@/hooks/entities/useCourse";
import { useStudyPlanStore } from "@/stores/studyPlanStore";
import {
  getAutoDefaultPlan,
  sortStudyPlansForDropdown,
} from "@/utils/studyPlanUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Presentation, Plus, CheckSquare, PlusCircle, Repeat } from "lucide-react";
import { useDialogStore } from "@/stores/useDialogStore";

export default function Workspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openDialog } = useDialogStore();

  // 1. Fetch data KHHT
  const { data: studyPlans, isLoading: isLoadingPlans } =
    useStudyPlan().getAllStudyPlans;
  const { activePlanId, setActivePlanId } = useStudyPlanStore();

  // 2. Fetch danh sách môn học của cái KHHT đang được chọn
  // (Đảm bảo hook của bác chỉ gọi API khi activePlanId có giá trị)
  const { data: courses, isLoading: isLoadingCourses } = useCourse({
    studyPlanId: Number(activePlanId),
  }).getCoursesByStudyPlan;

  // 3. ZERO-CLICK AUTO SELECT
  useEffect(() => {
    if (studyPlans && studyPlans.length > 0 && !activePlanId) {
      const defaultPlan = getAutoDefaultPlan(studyPlans);
      if (defaultPlan) setActivePlanId(defaultPlan.id);
    }
  }, [studyPlans, activePlanId, setActivePlanId]);

  const sortedPlans = useMemo(() => {
    if (!studyPlans) return [];
    return sortStudyPlansForDropdown(studyPlans);
  }, [studyPlans]);

  if (isLoadingPlans)
    return <div className="p-4 text-sm text-gray-500">Đang tải...</div>;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>KẾ HOẠCH HỌC TẬP</SidebarGroupLabel>
      <SidebarMenu>
        {/* Nút chọn Học kỳ */}
        <SidebarMenuItem>
          <Select
            value={activePlanId ? String(activePlanId) : ""}
            onValueChange={(value) => setActivePlanId(Number(value))}
          >
            <SelectTrigger className="w-full h-8 mb-2 bg-transparent border-gray-200">
              <SelectValue placeholder="Chọn kế hoạch học tập" />
            </SelectTrigger>
            <SelectContent>
              {sortedPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id!.toString()}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarMenuItem>

        {/* Cây danh sách môn học */}
        {activePlanId && (
          <SidebarMenuItem>
            {/* Thẻ Cha: Bấm vào ra trang Tổng Quan */}
            <SidebarMenuButton
              asChild
              isActive={
                location.pathname === `/app/study-plans/${activePlanId}`
              }
              onClick={() => navigate(`/app/study-plans/${activePlanId}`)}
              className="cursor-pointer font-semibold mt-1"
            >
              <div>
                <Presentation className="w-4 h-4 mr-2" />
                Tổng quan
              </div>
            </SidebarMenuButton>

            {/* Thẻ Con: List môn học thụt lề, có đường kẻ dọc dọc */}
            <SidebarMenuSub>
              {isLoadingCourses ? (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>
                    Đang tải môn học...
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : courses?.length === 0 ? (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton className="text-gray-400">
                    Chưa có môn học
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : (
                courses?.map((course) => {
                  const coursePath = `/app/courses/${course.id}`;
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
                      studyPlanId: Number(activePlanId),
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Nút mồi (Trigger) */}
                <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Thêm mới
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* Lựa chọn 1: Gọi Global Dialog mở Form Task */}
                <DropdownMenuItem
                  className="cursor-pointer py-3"
                  onClick={() =>
                    openDialog("TASK_FORM", {
                      studyPlanId: Number(activePlanId),
                    })
                  }
                >
                  <CheckSquare className="w-4 h-4 mr-3 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Công việc lẻ (Task)</span>
                    <span className="text-xs text-gray-500">
                      Deadline, bài tập, ôn thi...
                    </span>
                  </div>
                </DropdownMenuItem>

                {/* Lựa chọn 2: Gọi Global Dialog mở Form Routine */}
                <DropdownMenuItem
                  className="cursor-pointer py-3"
                  onClick={() =>
                    openDialog("ROUTINE_FORM", {
                      studyPlanId: Number(activePlanId),
                    })
                  }
                >
                  <Repeat className="w-4 h-4 mr-3 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      Lịch học cố định (Routine)
                    </span>
                    <span className="text-xs text-gray-500">
                      Lý thuyết, thực hành hàng tuần...
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
