import { type RouteObject, useRoutes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";

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
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <div>Login Page</div>,
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
