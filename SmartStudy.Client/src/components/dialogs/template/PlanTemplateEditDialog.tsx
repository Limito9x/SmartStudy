import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";
import { useDialogStore } from "@/stores/useDialogStore";

export default function PlanTemplateEditDialog() {
  const { data, closeDialog } = useDialogStore();
  const { updateTemplate, updatePlanTemplate } = usePlanTemplate();

  const payload = data as {
    templateId: number;
    defaultValues: {
      name: string;
      description: string | null;
      isPublic: boolean;
    };
  };

  const [name, setName] = useState(payload?.defaultValues?.name || "");
  const [description, setDescription] = useState(
    payload?.defaultValues?.description || "",
  );
  const [isPublic, setIsPublic] = useState(!!payload?.defaultValues?.isPublic);

  const handleSubmit = async () => {
    if (!payload?.templateId) {
      return;
    }

    await updateTemplate(payload.templateId, {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      isPublic,
    });

    closeDialog();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Tên template</Label>
        <Input
          id="template-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nhập tên template"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Mô tả</Label>
        <Input
          id="template-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Nhập mô tả"
        />
      </div>

      <div className="flex items-center justify-between rounded border p-3">
        <Label htmlFor="template-is-public">Công khai template</Label>
        <Switch
          id="template-is-public"
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
          disabled={!name.trim() || updatePlanTemplate.isPending}
        >
          {updatePlanTemplate.isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </div>
  );
}
