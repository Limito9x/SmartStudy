import { type RouteObject, useRoutes } from "react-router-dom";
import LandingPage from "@/pages/landing/LandingPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SchoolStudyLayout from "@/layouts/SchoolStudyLayout";
import SemesterPage from "@/pages/school-study/Semester/SemesterPage";
import RedirectSemesterPage from "@/pages/school-study/Semester/RedirectSemesterPage";
import CoursePage from "@/pages/school-study/Course/CoursePage";

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
      path: "/app",
      element: <DashboardLayout />,
      children: [
        {
          path: "",
          element: <div>Dashboard Page</div>,
          index: true,
        },
        {
          path: "profile",
          element: <div>Profile Page</div>,
        },
        {
          path: "semesters",
          element: <SchoolStudyLayout />,
          children: [
            {
              path: ":semesterId",
              element: <SemesterPage />,
            },
            {
              path: ":semesterId/courses/:courseId",
              element: <CoursePage />,
            },
            {
              path: "",
              element: <RedirectSemesterPage />,
              index: true,
            },
          ],
        },
      ],
    },
  ];

  const element = useRoutes(routes);

  return element;
}
