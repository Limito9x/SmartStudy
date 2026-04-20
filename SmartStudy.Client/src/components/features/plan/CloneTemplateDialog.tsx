import { useEffect, useMemo, useState } from "react";
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
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import type { StudyPlanType } from "@/services/api";

interface CloneTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: number;
  templateType: StudyPlanType;
  selectedCourseRefs: string[];
  defaultPlanName?: string;
  onApplySuccess?: (response: unknown) => void;
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
  templateType,
  selectedCourseRefs,
  defaultPlanName,
  onApplySuccess,
}: CloneTemplateDialogProps) {
  const [targetMode, setTargetMode] = useState<"existing" | "new">("existing");
  const [targetPlanId, setTargetPlanId] = useState<number | null>(null);
  const [newPlanName, setNewPlanName] = useState(defaultPlanName || "");
  const [newPlanStartDate, setNewPlanStartDate] = useState(
    toDateInputValue(new Date()),
  );

  const { importSelectedCourses, importSelectedCoursesMutation } =
    usePlanTemplate();
  const { getAllStudyPlans } = useStudyPlan();
  const { data: activePlans = [], isLoading } = getAllStudyPlans(true);

  const activeAcademicPlan = useMemo(
    () =>
      activePlans.find(
        (plan) => plan.type === "Academic" && plan.status === "Active",
      ) ?? null,
    [activePlans],
  );

  const activePersonalPlans = useMemo(
    () => activePlans.filter((plan) => plan.type === "Personal"),
    [activePlans],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (templateType === "Personal") {
      setTargetMode("existing");
      setTargetPlanId(
        activePersonalPlans.length > 0
          ? Number(activePersonalPlans[0].id)
          : null,
      );
      setNewPlanName(defaultPlanName || "");
      setNewPlanStartDate(toDateInputValue(new Date()));
      return;
    }

    setTargetPlanId(activeAcademicPlan ? Number(activeAcademicPlan.id) : null);
  }, [
    open,
    templateType,
    activePersonalPlans,
    activeAcademicPlan,
    defaultPlanName,
  ]);

  const canSubmit = useMemo(() => {
    if (selectedCourseRefs.length === 0) {
      return false;
    }

    if (templateType === "Academic") {
      return !!activeAcademicPlan;
    }

    if (targetMode === "existing") {
      return !!targetPlanId;
    }

    return !!newPlanStartDate;
  }, [
    selectedCourseRefs.length,
    templateType,
    activeAcademicPlan,
    targetMode,
    targetPlanId,
    newPlanStartDate,
  ]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const response = await importSelectedCourses({
      templateId,
      targetPlanId:
        templateType === "Academic"
          ? Number(activeAcademicPlan?.id ?? 0)
          : targetMode === "existing"
            ? Number(targetPlanId ?? 0)
            : 0,
      courseRefs: selectedCourseRefs,
      createNewPlan: templateType === "Personal" && targetMode === "new",
      newPlanName:
        templateType === "Personal" && targetMode === "new"
          ? newPlanName.trim() || null
          : null,
      newPlanStartDate:
        templateType === "Personal" && targetMode === "new"
          ? new Date(newPlanStartDate).toISOString()
          : null,
    });

    onApplySuccess?.(response);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Áp dụng template vào KHHT</DialogTitle>
          <DialogDescription>
            {templateType === "Academic"
              ? "Template đại học sẽ được áp dụng vào KHHT đại học đang hoạt động."
              : "Chọn KHHT cá nhân hiện có hoặc tạo KHHT mới rồi áp dụng các môn đã chọn."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Đang tải danh sách KHHT...
            </p>
          ) : null}

          {templateType === "Academic" ? (
            activeAcademicPlan ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="font-medium">KHHT đích</p>
                <p className="mt-1 text-muted-foreground">
                  {activeAcademicPlan.name || `KHHT #${activeAcademicPlan.id}`}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Không có KHHT đại học đang hoạt động. Vui lòng tạo KHHT trước
                khi áp dụng template.
              </div>
            )
          ) : (
            <>
              <div className="space-y-2">
                <Label>Chế độ áp dụng</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={targetMode === "existing" ? "default" : "outline"}
                    onClick={() => setTargetMode("existing")}
                  >
                    KHHT hiện có
                  </Button>
                  <Button
                    type="button"
                    variant={targetMode === "new" ? "default" : "outline"}
                    onClick={() => setTargetMode("new")}
                  >
                    Tạo KHHT mới
                  </Button>
                </div>
              </div>

              {targetMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="apply-target-plan">Chọn KHHT cá nhân</Label>
                  <select
                    id="apply-target-plan"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={targetPlanId ?? ""}
                    onChange={(event) =>
                      setTargetPlanId(Number(event.target.value))
                    }
                  >
                    {activePersonalPlans.length === 0 ? (
                      <option value="">
                        Không có KHHT cá nhân đang hoạt động
                      </option>
                    ) : null}
                    {activePersonalPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="new-plan-name">Tên KHHT mới</Label>
                    <Input
                      id="new-plan-name"
                      value={newPlanName}
                      onChange={(event) => setNewPlanName(event.target.value)}
                      placeholder={defaultPlanName || "KHHT cá nhân mới"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-plan-start-date">Ngày bắt đầu</Label>
                    <Input
                      id="new-plan-start-date"
                      type="date"
                      value={newPlanStartDate}
                      onChange={(event) =>
                        setNewPlanStartDate(event.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </>
          )}
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
            disabled={!canSubmit || importSelectedCoursesMutation.isPending}
          >
            {importSelectedCoursesMutation.isPending
              ? "Đang áp dụng..."
              : "Áp dụng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
