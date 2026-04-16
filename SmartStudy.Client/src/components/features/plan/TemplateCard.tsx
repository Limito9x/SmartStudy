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
  const templateData = template as PlanTemplateDto & {
    type?: "Academic" | "Personal";
    phaseCount?: number | string;
    milestoneCount?: number | string;
    cloneCount?: number | string;
    contextTag?: string;
    coursePreviewNames?: string[];
    phasePreviewNames?: string[];
  };

  const durationDays = Number(template.durationDays ?? 0);
  const durationWeeks = Math.max(1, Math.ceil(durationDays / 7));
  const courseCount = Number(template.courseCount ?? 0);
  const phaseCount = Number(templateData.phaseCount ?? 0);
  const milestoneCount = Number(templateData.milestoneCount ?? 0);
  const cloneCount = Number(templateData.cloneCount ?? 0);
  const typeLabel =
    templateData.type === "Personal"
      ? "Cá nhân"
      : templateData.type === "Academic"
        ? "Đại học"
        : template.isPublic
          ? "Công khai"
          : "Riêng tư";

  const topCourseChips = (templateData.coursePreviewNames ?? [])
    .filter((item) => item.trim() !== "")
    .slice(0, 2)
    .map((item) => item);
  const topPhaseChips = (templateData.phasePreviewNames ?? [])
    .filter((item) => item.trim() !== "")
    .slice(0, 2)
    .map((item) => item);
  const topChips = [...topCourseChips, ...topPhaseChips].slice(0, 3);

  const generatedDescription = `${courseCount} môn học • ${phaseCount} giai đoạn • ${milestoneCount} cột mốc, phù hợp để bắt đầu nhanh trong ${durationWeeks} tuần.`;

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
          <Badge variant="outline">{typeLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-slate-700">
          {courseCount} môn học • {phaseCount} giai đoạn • {milestoneCount} cột
          mốc
        </p>

        {topChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topChips.map((chip) => (
              <Badge key={chip} variant="secondary" className="max-w-full">
                <span className="truncate">{chip}</span>
              </Badge>
            ))}
          </div>
        ) : null}

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.description || generatedDescription}
        </p>
      </CardContent>

      <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-0 text-xs">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{cloneCount} lượt dùng</Badge>
          {templateData.contextTag ? (
            <Badge variant="secondary">{templateData.contextTag}</Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {template.routineCount ?? 0} routine
          </Badge>
        </div>

        <Badge variant="secondary">{durationWeeks} tuần</Badge>
      </CardFooter>
    </Card>
  );
}
