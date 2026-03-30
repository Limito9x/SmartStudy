import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanTemplateDto } from "@/services/api";

interface TemplateCardProps {
  template: PlanTemplateDto;
  onClick?: (template: PlanTemplateDto) => void;
  actionSlot?: ReactNode;
  className?: string;
}

export default function TemplateCard({
  template,
  onClick,
  actionSlot,
  className,
}: TemplateCardProps) {
  const durationDays = Number(template.durationDays ?? 0);
  const durationWeeks = Math.max(1, Math.ceil(durationDays / 7));

  return (
    <Card
      className={cn(
        "relative flex h-full cursor-pointer flex-col justify-between border transition-all hover:border-primary/50 hover:shadow-md",
        onClick ? "cursor-pointer" : "",
        className,
      )}
      onClick={() => onClick?.(template)}
    >
      {actionSlot ? (
        <div className="absolute right-3 top-3">{actionSlot}</div>
      ) : null}

      <CardHeader className="pb-2 pr-10">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-1 text-lg font-bold">
            {template.name || "Template chưa đặt tên"}
          </CardTitle>
          <Badge variant="outline">
            {template.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.description || "Không có mô tả"}
        </p>
      </CardContent>

      <CardFooter className="mt-auto flex flex-wrap gap-2 pt-0 text-xs">
        <Badge variant="secondary">{template.courseCount ?? 0} môn</Badge>
        <Badge variant="secondary">{durationWeeks} tuần</Badge>
        <Badge variant="secondary">{template.routineCount ?? 0} routines</Badge>
      </CardFooter>
    </Card>
  );
}
