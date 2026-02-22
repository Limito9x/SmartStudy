import { type RouteObject, useRoutes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/Auth/LoginPage";
import SchoolStudyPage from "@/pages/SchoolStudy/SchoolStudy";

export default function AppRoutes() {
  const routes: RouteObject[] = [
    {
      path: "/",
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
          path: "school",
          element: <SchoolStudyPage />,
        },
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
          index: true,
        },
        {
          path: "register",
          element: <div>Register Page</div>,
        },
      ],
    },
  ];

  const element = useRoutes(routes);

  return element;
}
