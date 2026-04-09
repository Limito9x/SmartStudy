import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ActionProps {
  label: string;
  onClick: () => void;
}

interface ActionMenuProps {
  actions: ActionProps[];
}

export default function ActionMenu({ actions }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="hover:bg-gray-200 p-1 rounded transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions?.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
              action.onClick();
            }}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
