import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDialogStore } from "@/stores/useDialogStore";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";

export default function PlanTemplateSelectPlanDialog() {
  const { closeDialog } = useDialogStore();
  const { getAllStudyPlans } = useStudyPlan();
  const { createTemplate, createPlanTemplate } = usePlanTemplate();

  const { data: studyPlans = [], isLoading } = getAllStudyPlans(true);

  const [sourcePlanId, setSourcePlanId] = useState<number | null>(
    studyPlans.length > 0 ? Number(studyPlans[0].id) : null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const selectedSourcePlanId =
    sourcePlanId ?? (studyPlans[0]?.id ? Number(studyPlans[0].id) : null);

  const handleSubmit = async () => {
    if (!selectedSourcePlanId) {
      return;
    }

    await createTemplate({
      sourcePlanId: selectedSourcePlanId,
      name: name.trim() || null,
      description: description.trim() || null,
      isPublic,
    });

    closeDialog();
  };

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Đang tải danh sách kế hoạch...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source-plan">Chọn kế hoạch nguồn</Label>
        <select
          id="source-plan"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={selectedSourcePlanId ?? ""}
          onChange={(event) => setSourcePlanId(Number(event.target.value))}
        >
          {studyPlans.length === 0 ? (
            <option value="">Không có kế hoạch</option>
          ) : null}
          {studyPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-name">Tên template (tùy chọn)</Label>
        <Input
          id="template-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nếu để trống sẽ dùng tên mặc định"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Mô tả</Label>
        <Input
          id="template-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded border p-3">
        <Label htmlFor="template-public">Công khai sau khi tạo</Label>
        <Switch
          id="template-public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeDialog}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedSourcePlanId || createPlanTemplate.isPending}
        >
          {createPlanTemplate.isPending ? "Đang tạo..." : "Tạo template"}
        </Button>
      </div>
    </div>
  );
}
