import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getProfileOptions } from "@/services/api/@tanstack/react-query.gen";

export function OnboardingGuard() {
  const user = useAuthStore((s) => s.user);

  const { data: profileData, isLoading } = useQuery({
    ...getProfileOptions(),
    enabled: !!user,
  });

  if (isLoading && !!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang kiểm tra hồ sơ...
      </div>
    );
  }

  const isAdmin = profileData?.roles?.includes("Admin");
  const hasStudentProfile = !!profileData?.studentInfo?.university;

  if (user && !isAdmin)
  {
    if (!hasStudentProfile) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Outlet />;
  }
  
}
