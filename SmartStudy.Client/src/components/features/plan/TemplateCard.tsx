import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
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
          <CardTitle className="line-clamp-2 text-base">
            {template.name || "Template chưa đặt tên"}
          </CardTitle>
          <Badge variant={template.isPublic ? "default" : "secondary"}>
            {template.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.description || "Không có mô tả"}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{template.courseCount ?? 0} môn</Badge>
          <Badge variant="outline">{template.routineCount ?? 0} routine</Badge>
          <Badge variant="outline">{template.durationDays ?? 0} ngày</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
