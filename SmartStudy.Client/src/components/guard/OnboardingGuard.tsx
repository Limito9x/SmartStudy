import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function OnboardingGuard() {
  const user = useAuthStore((s) => s.user);
  if (!user?.hasCompletedOnboarding)
    return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
