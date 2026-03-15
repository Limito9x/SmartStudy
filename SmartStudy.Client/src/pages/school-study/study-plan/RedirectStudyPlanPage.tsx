import { Navigate, useOutletContext } from "react-router-dom";
import type { StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";

export default function RedirectStudyPlanPage() {
  const { currentStudyPlan } = useOutletContext<StudyPlanOutletContext>();

  if (!currentStudyPlan) {
    return <div>Không có kế hoạch học tập nào đang hoạt động</div>;
  }
  return <Navigate to={`/app/study-plans/${currentStudyPlan.id}/overview`} replace />;
}
