import { useMemo, useState } from "react";
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
    templateId?: number;
    defaultValues: {
      name: string;
      description: string | null;
      isPublic: boolean;
    };
    mode?: "edit" | "publish";
    lockPublic?: boolean;
    nameHint?: string;
    submitLabel?: string;
    onSubmit?: (values: {
      name: string;
      description: string | null;
      isPublic: boolean;
    }) => Promise<void> | void;
  };

  const [name, setName] = useState(payload?.defaultValues?.name || "");
  const [description, setDescription] = useState(
    payload?.defaultValues?.description || "",
  );
  const [isPublic, setIsPublic] = useState(!!payload?.defaultValues?.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectivePublic = payload?.lockPublic ? true : isPublic;
  const submitLabel = payload?.submitLabel || "Lưu";
  const canSubmit =
    !!name.trim() && !updatePlanTemplate.isPending && !isSubmitting;
  const helperText = useMemo(() => {
    if (payload?.nameHint && payload.nameHint.trim()) {
      return `Gợi ý: ${payload.nameHint}`;
    }

    return null;
  }, [payload?.nameHint]);

  const handleSubmit = async () => {
    const normalizedValues = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      isPublic: effectivePublic,
    };

    if (payload?.onSubmit) {
      try {
        setIsSubmitting(true);
        await payload.onSubmit(normalizedValues);
        closeDialog();
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!payload?.templateId) {
      return;
    }

    await updateTemplate(payload.templateId, normalizedValues);

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
        {helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
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
          checked={effectivePublic}
          onCheckedChange={setIsPublic}
          disabled={!!payload?.lockPublic}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={closeDialog}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {updatePlanTemplate.isPending || isSubmitting
            ? "Đang lưu..."
            : submitLabel}
        </Button>
      </div>
    </div>
  );
}
