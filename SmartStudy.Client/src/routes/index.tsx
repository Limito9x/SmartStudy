import { type RouteObject, useRoutes } from "react-router-dom";
import LandingPage from "@/pages/landing/LandingPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SchoolStudyLayout from "@/layouts/StudyPlanLayout";
import SemesterPage from "@/pages/school-study/study-plan/StudyPlanPage";
import SemesterSchedulePage from "@/pages/school-study/schedule/SemesterSchedulePage";
import RedirectSemesterPage from "@/pages/school-study/study-plan/RedirectStudyPlanPage";
import CoursePage from "@/pages/school-study/course/CoursePage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import SubjectPage from "@/pages/subject/SubjectPage";
import OnboardingPage from "@/pages/survey/onboarding/OnboardingPage";
import MainPage from "@/pages/main/MainPage";

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
      path: "onboarding",
      element: <OnboardingPage />,
    },
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
          path: "study-plans",
          element: <SchoolStudyLayout />,
          children: [
            {
              path: ":studyPlanId",
              element: <SemesterPage />,
            },
            {
              path: ":studyPlanId/courses/:courseId",
              element: <CoursePage />,
            },
            {
              path: "",
              element: <RedirectSemesterPage />,
              index: true,
            },
            {
              path: ":studyPlanId/schedule",
              element: <SemesterSchedulePage />,
            },
          ],
        },
        {
          path: "calendar",
          element: <CalendarPage />,
        },
      ],
    },
  ];

  const element = useRoutes(routes);

  return element;
}
