import { Navigate, useOutletContext } from "react-router-dom";
import type { StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";

export default function RedirectStudyPlanPage() {
  const { selectedStudyPlan } = useOutletContext<StudyPlanOutletContext>();

  if (!selectedStudyPlan) {
    return <div>Không có kế hoạch học tập nào đang hoạt động</div>;
  }
  return <Navigate to={`/app/study-plans/${selectedStudyPlan.id}/overview`} replace />;
}
