import { useEffect } from "react";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
// Bác check lại xem import hook Course của bác đúng đường dẫn này không nhé:
import { useCourse } from "@/hooks/entities/useCourse";
import { getAutoDefaultPlan } from "@/utils/studyPlanUtils";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, CheckSquare, PlusCircle, Repeat, Flag } from "lucide-react";
import { useDialogStore } from "@/stores/useDialogStore";
import { useState } from "react";
import PlanNav from "./plan-nav";
import { Separator } from "@/components/ui/separator";

export default function Workspace() {
  const { openDialog } = useDialogStore();
  const [selectedPersonalPlanId, setSelectedPersonalPlanId] = useState<
    number | null
  >(null);

  // 1. Fetch data KHHT
  const { data: studyPlans, isLoading: isLoadingPlans } =
    useStudyPlan().getAllStudyPlans(true);

  const academicPlan =
    studyPlans?.find((plan) => plan.type === "Academic") || null;

  const personalPlans =
    studyPlans?.filter((plan) => plan.type === "Personal") || [];
  const selectedPersonalPlan =
    personalPlans.length > 0 ? personalPlans[0] : null;

  // 2. Fetch danh sách môn học của cái KHHT đang được chọn
  // (Đảm bảo hook của bác chỉ gọi API khi activePlanId có giá trị)
  const { data: academicCourses, isLoading: isLoadingAcademicCourses } =
    useCourse({
      studyPlanId: Number(academicPlan?.id),
    }).getCourses;

  const { data: personalCourses, isLoading: isLoadingPersonalCourses } =
    useCourse({
      studyPlanId: selectedPersonalPlanId!,
    }).getCourses;

  // 3. ZERO-CLICK AUTO SELECT
  useEffect(() => {
    if (personalPlans.length > 0) {
      const defaultPlan = getAutoDefaultPlan(personalPlans);
      setSelectedPersonalPlanId(Number(defaultPlan?.id) || null);
    }
  }, [personalPlans, selectedPersonalPlan]);

  if (isLoadingPlans)
    return <div className="p-4 text-sm text-gray-500">Đang tải...</div>;

  return (
    <SidebarGroup>
      <div className="flex justify-between items-center p-2">
        <div>
          <SidebarGroupLabel>KẾ HOẠCH HỌC TẬP ĐẠI HỌC</SidebarGroupLabel>
          {academicPlan ? (
            <span className="text-black">{academicPlan.name}</span>
          ) : (
            <span className="text-gray-400">
              Chưa có KHHT đại học, hãy thêm ngay!
            </span>
          )}
        </div>

        {!academicPlan && (
          <Button
            size={"icon-sm"}
            onClick={() => {
              openDialog("STUDY_PLAN_FORM", {});
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      <SidebarMenu>
        {academicPlan && (
          <PlanNav
            type="Academic"
            planId={Number(academicPlan?.id) || null}
            courses={academicCourses}
            isLoadingCourses={isLoadingAcademicCourses}
          />
        )}

        <Separator />
        <div className="flex justify-between items-center p-2">
          <SidebarGroupLabel>KẾ HOẠCH HỌC TẬP CÁ NHÂN</SidebarGroupLabel>
          <Button
            size={"icon-sm"}
            onClick={() => {
              openDialog("STUDY_PLAN_FORM", {
                defaultValues: {
                  type: "Personal",
                  name: "",
                  startDate: "",
                  endDate: "",
                  termId: null,
                  yearId: null,
                },
              });
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <SidebarMenuItem>
          <Select
            value={
              selectedPersonalPlanId ? String(selectedPersonalPlan?.id) : ""
            }
            onValueChange={(value) => setSelectedPersonalPlanId(Number(value))}
            disabled={personalPlans.length === 0}
          >
            <SelectTrigger className="w-full h-8 mb-2 bg-transparent border-gray-200">
              <SelectValue
                placeholder={
                  personalPlans.length === 0
                    ? "Chưa có KHHT cá nhân"
                    : "Chọn kế hoạch..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {personalPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id!.toString()}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarMenuItem>
        {selectedPersonalPlanId && (
          <PlanNav
            type="Personal"
            planId={selectedPersonalPlanId}
            courses={personalCourses} // Tạm thời vẫn show môn học của KHHT ĐH vì chưa có API lấy môn học theo KHHT cá nhân
            isLoadingCourses={isLoadingPersonalCourses}
          />
        )}

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
              onClick={() => openDialog("TASK_FORM", {})}
            >
              <CheckSquare className="w-4 h-4 mr-3 text-green-600" />
              <div className="flex flex-col">
                <span className="font-semibold">Công việc lẻ (Task)</span>
                <span className="text-xs text-gray-500">
                  Bài tập, ôn thi...
                </span>
              </div>
            </DropdownMenuItem>

            {/* Lựa chọn 2: Gọi Global Dialog mở Form Routine */}
            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => openDialog("ROUTINE_FORM", {})}
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

            <DropdownMenuItem
              className="cursor-pointer py-3"
              onClick={() => openDialog("EVENT_FORM", {})}
            >
              <Flag className="w-4 h-4 mr-3 text-red-600" />
              <div className="flex flex-col">
                <span className="font-semibold">Sự kiện</span>
                <span className="text-xs text-gray-500">
                  Deadline, ngày thi, ngày nộp bài...
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenu>
    </SidebarGroup>
  );
}
