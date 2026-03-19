import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";

interface CloneTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: number;
  defaultName?: string;
  onCloneSuccess?: (response: unknown) => void;
}

const toDateInputValue = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function CloneTemplateDialog({
  open,
  onOpenChange,
  templateId,
  defaultName,
  onCloneSuccess,
}: CloneTemplateDialogProps) {
  const [name, setName] = useState(defaultName || "");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const { cloneTemplate, clonePlanTemplate } = usePlanTemplate();

  const canSubmit = useMemo(() => {
    return !!startDate;
  }, [startDate]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const response = await cloneTemplate({
      templateId,
      name: name.trim() || null,
      startDate: new Date(startDate).toISOString(),
    });

    onCloneSuccess?.(response);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhân bản template</DialogTitle>
          <DialogDescription>
            Nhập tên kế hoạch mới và ngày bắt đầu để tạo Study Plan từ template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clone-template-name">Tên kế hoạch</Label>
            <Input
              id="clone-template-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={defaultName || "Kế hoạch mới"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clone-template-start-date">Ngày bắt đầu</Label>
            <Input
              id="clone-template-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || clonePlanTemplate.isPending}
          >
            {clonePlanTemplate.isPending ? "Đang tạo..." : "Tạo kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
