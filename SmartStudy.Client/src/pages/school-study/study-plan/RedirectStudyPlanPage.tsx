import { Navigate, useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/StudyPlanLayout";

export default function RedirectStudyPlanPage() {
  const { studyPlans } = useOutletContext<SemesterOutletContext>();

  const activeSemester = studyPlans?.find(
    (studyPlan) => studyPlan.status === "Active",
  );

  if (!activeSemester) {
    return <div>Không có kế hoạch học tập nào đang hoạt động</div>;
  }
  return <Navigate to={`/app/study-plans/${activeSemester.id}`} replace />;
}
