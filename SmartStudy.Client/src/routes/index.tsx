import { type RouteObject, useRoutes } from "react-router-dom";
import LandingPage from "@/pages/landing/LandingPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import CoursePage from "@/pages/school-study/course/CoursePage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import SubjectPage from "@/pages/subject/SubjectPage";
import OnboardingPage from "@/pages/survey/onboarding/OnboardingPage";
import MainPage from "@/pages/main/MainPage";
import { AuthGuard } from "@/components/guard/AuthGuard";
import { OnboardingGuard } from "@/components/guard/OnboardingGuard";
import PlanOverviewTab from "@/pages/school-study/study-plan/PlanOverviewTab";
import AdminLayout from "@/layouts/AdminLayout";
import UserManagementPage from "@/pages/admin/users/UserManagementPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";

export default function AppRoutes() {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      element: <AuthGuard />,
      children: [
        {
          path: "onboarding",
          element: <OnboardingPage />,
        },
        {
          element: <OnboardingGuard />,
          children: [
            {
              path: "/app",
              element: <DashboardLayout />,
              children: [
                {
                  path: "",
                  element: <MainPage />,
                  index: true,
                },
                {
                  path: "profile",
                  element: <div>Profile Page</div>,
                },
                {
                  path: "subjects",
                  element: <SubjectPage />,
                },
                {
                  path: "study-plans/:studyPlanId",
                  children: [
                    {
                      path: "",
                      element: <PlanOverviewTab />,
                      index: true,
                    },
                  ],
                },
                {
                  path: "courses/:courseId",
                  element: <CoursePage />,
                },
                {
                  path: "calendar",
                  element: <CalendarPage />,
                },
              ],
            },
          ],
        },
        {
          path: "/admin",
          element: <AdminLayout />,
          children: [
            {
              path: "",
              element: <AdminOverviewPage />,
              index: true,
            },
            {
              path: "users",
              element: <UserManagementPage />,
            },
          ],
        },
      ],
    },
  ];

  const element = useRoutes(routes);

  return element;
}
