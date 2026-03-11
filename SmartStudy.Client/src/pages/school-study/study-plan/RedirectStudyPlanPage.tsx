import { Navigate, useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/StudyPlanLayout";

export default function RedirectStudyPlanPage() {
  const { currentStudyPlan } = useOutletContext<SemesterOutletContext>();

  if (!currentStudyPlan) {
    return <div>Không có kế hoạch học tập nào đang hoạt động</div>;
  }
  return <Navigate to={`/app/study-plans/${currentStudyPlan.id}`} replace />;
}
