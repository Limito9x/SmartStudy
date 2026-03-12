import { LoginForm } from "@/components/forms/user/login";
import { RegisterForm } from "@/components/forms/user/register";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const m = searchParams.get("mode") === "register" ? "register" : "login";
    setMode(m);
  }, [searchParams]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex flex-col justify-center bg-primary px-12 text-primary-foreground">
        <h1 className="text-4xl font-extrabold tracking-tight">SmartStudy</h1>
        <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
          Quản lý kế hoạch học tập, theo dõi tiến độ và nhận trợ giúp từ AI —
          tất cả trong một nền tảng.
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile branding */}
          <div className="text-center lg:hidden">
            <h1
              className="text-2xl font-bold text-primary cursor-pointer"
              onClick={() => navigate("/")}
            >
              SmartStudy
            </h1>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Đăng nhập để tiếp tục học tập"
                : "Đăng ký miễn phí để bắt đầu"}
            </p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "login" | "register")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
