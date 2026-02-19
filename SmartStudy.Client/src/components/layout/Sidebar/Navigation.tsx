import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  { label: "Tổng quan", path: "/" },
  { label: "Học tập chính khóa", path: "/school" },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              isActive && "bg-accent text-accent-foreground font-medium",
            )}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
