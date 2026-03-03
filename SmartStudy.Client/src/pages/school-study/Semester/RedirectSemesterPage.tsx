import { Navigate, useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/SchoolStudyLayout";

export default function RedirectSemesterPage() {
  const { semesters } = useOutletContext<SemesterOutletContext>();

  const activeSemester = semesters?.find(
    (semester) => semester.status === "Active",
  );

  if (!activeSemester) {
    return <div>Không có học kỳ nào đang hoạt động</div>;
  }
  return <Navigate to={`/app/semesters/${activeSemester.id}`} replace />;
}
