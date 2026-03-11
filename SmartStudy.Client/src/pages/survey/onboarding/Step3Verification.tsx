import { useFormContext } from "react-hook-form";
import type { SettingFormValues } from "@/components/forms/user/student-info/schema";
import type { RequestStudyPlanDto } from "@/services/api";
import PlanGroupedList from "@/components/features/plan/PlanGroupedList";
import { format } from "date-fns";

interface Step3VerificationProps {
  previewPlans: RequestStudyPlanDto[];
}

export default function Step3Verification({
  previewPlans,
}: Step3VerificationProps) {
  const { getValues } = useFormContext<SettingFormValues>();
  const values = getValues();

  const semesterLabel =
    values.semestersPerYear === 2
      ? "2 học kỳ chính + 1 học kỳ hè"
      : "3 học kỳ chính";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-medium">Xác nhận thông tin</p>
        <p className="text-sm text-muted-foreground">
          Vui lòng kiểm tra lại thông tin bạn đã nhập trước khi hoàn tất.
        </p>
      </div>

      {/* Student info summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Thông tin sinh viên
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Trường</dt>
          <dd className="font-medium">{values.university}</dd>

          <dt className="text-muted-foreground">Ngành</dt>
          <dd className="font-medium">{values.major}</dd>

          <dt className="text-muted-foreground">Khóa</dt>
          <dd className="font-medium">{values.cohort}</dd>

          <dt className="text-muted-foreground">Ngày nhập học</dt>
          <dd className="font-medium">
            {format(values.admissionDate, "dd/MM/yyyy")}
          </dd>

          <dt className="text-muted-foreground">Hệ đào tạo</dt>
          <dd className="font-medium">{semesterLabel}</dd>

          <dt className="text-muted-foreground">Thời gian đào tạo</dt>
          <dd className="font-medium">{values.programLength} năm</dd>

          <dt className="text-muted-foreground">Số tuần/học kỳ</dt>
          <dd className="font-medium">{values.weeksPerSemester} tuần</dd>

          {values.semestersPerYear === 2 && (
            <>
              <dt className="text-muted-foreground">Số tuần học kỳ hè</dt>
              <dd className="font-medium">
                {values.weeksOfSummerSemester} tuần
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* Plan preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kế hoạch học tập ({previewPlans.length} học kỳ)
        </h3>
        {previewPlans.length > 0 ? (
          <PlanGroupedList plans={previewPlans} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Không thể tạo kế hoạch. Vui lòng kiểm tra lại thông tin chương trình
            đào tạo.
          </p>
        )}
      </div>
    </div>
  );
}
