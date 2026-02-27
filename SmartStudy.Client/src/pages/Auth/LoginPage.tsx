import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/forms/user/login";
import { RegisterForm } from "@/components/forms/user/register";
import { useState } from "react";

export default function LoginPage() {
  const[mode, setMode] = useState<"login" | "register">("login");

  return (
    <div>
      <div className="max-w-md mx-auto mt-10 p-6 border rounded">
        <div className="mb-4 flex justify-center space-x-4">
          <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
            Đến đăng nhập
          </Button>
          <Button variant={mode === "register" ? "default" : "outline"} onClick={() => setMode("register")}>
            Đến đăng ký
          </Button>
        </div>
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
