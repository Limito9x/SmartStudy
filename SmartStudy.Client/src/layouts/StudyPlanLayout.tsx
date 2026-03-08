import { type StudyPlanStatus } from "@/services/api";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import { type ResponseStudyPlanDto } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Outlet, useNavigate, useParams } from "react-router-dom";

type StudyPlanStatusMap = Record<
  StudyPlanStatus,
  {
    text: string;
    color: string;
  }
>;

export type SemesterOutletContext = {
  studyPlans: ResponseStudyPlanDto[] | undefined;
  currentStudyPlan: ResponseStudyPlanDto | null;
};

const semesterStatusMap: StudyPlanStatusMap = {
  Active: { text: "Đang học", color: "bg-blue-500" },
  Past: { text: "Đã kết thúc", color: "bg-gray-500" },
  Future: { text: "Sắp tới", color: "bg-green-300" },
};

export default function SchoolStudyLayout() {
  const navigate = useNavigate();
  const { semesterId } = useParams<{ semesterId: string }>();

  const { data: studyPlans, isLoading } = useStudyPlan().getAllStudyPlans;

  const currentStudyPlan =
    studyPlans?.find((s) => s.id.toString() === semesterId) ?? null;

  const handleRedirectToSemester = (semester: ResponseStudyPlanDto) => {
    navigate(`/app/semesters/${semester.id}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <Select
              value={
                currentStudyPlan ? currentStudyPlan.id.toString() : undefined
              }
              onValueChange={(value) => {
                const selectedStudyPlan = studyPlans?.find(
                  (s) => s.id.toString() === value,
                );
                if (selectedStudyPlan) {
                  handleRedirectToSemester(selectedStudyPlan);
                }
              }}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {studyPlans?.map((studyPlan) => {
                  const title = `HK${studyPlan.academicTermId} - ${studyPlan.academicYearId}`;
                  const statusInfo = semesterStatusMap[studyPlan.status];
                  return (
                    <SelectItem
                      key={studyPlan.id}
                      value={studyPlan.id.toString()}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full mr-2 ${statusInfo.color}`}
                        ></span>
                        {title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Outlet context={{ studyPlans, currentStudyPlan }} />
          </div>
        </>
      )}
    </div>
  );
}
