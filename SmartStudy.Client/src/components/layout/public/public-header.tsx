import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold">SmartStudy</h1>
      <Button variant="outline" className="ml-auto" onClick={() => navigate("/login")}>
        Đăng nhập
      </Button>
    </header>
  );
}
