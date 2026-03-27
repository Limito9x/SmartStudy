import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { asNumber } from "@/components/features/main/today-formatters";

interface TodayKpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  deltaValue?: number | string | null;
  deltaUnit?: string;
}

function DeltaLine({
  value,
  unit,
}: {
  value: number | string | null | undefined;
  unit: string;
}) {
  const delta = asNumber(value);

  if (delta === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Không đổi so với tuần trước
      </p>
    );
  }

  const isUp = delta > 0;
  const formatted = Math.abs(delta).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <p
      className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-rose-600"}`}
    >
      {isUp ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {formatted}
      {unit} so với tuần trước
    </p>
  );
}

export default function TodayKpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  deltaValue,
  deltaUnit,
}: TodayKpiCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <Icon
            className={`h-5 w-5 shrink-0 text-muted-foreground ${iconClassName ?? ""}`}
          />
        </div>

        {deltaUnit ? (
          <DeltaLine value={deltaValue} unit={deltaUnit} />
        ) : (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
