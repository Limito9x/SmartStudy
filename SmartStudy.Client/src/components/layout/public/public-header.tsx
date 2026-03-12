import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-xl font-bold tracking-tight text-primary">
            SmartStudy
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
          <Button onClick={() => navigate("/login?mode=register")}>
            Đăng ký miễn phí
          </Button>
        </div>
      </div>
    </header>
  );
}
