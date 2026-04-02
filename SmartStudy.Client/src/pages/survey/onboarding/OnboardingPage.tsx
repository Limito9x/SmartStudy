import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Stepper } from "@/components/ui/custom/stepper";
import {
  settingSchema,
  type SettingFormValues,
} from "@/components/forms/user/student-info/schema";
import { settingStudentInfoMutation } from "@/services/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import Step1Personal from "./Step1Personal";
import Step2Program from "./Step2Program";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { getProfileQueryKey } from "@/services/api/@tanstack/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import { addMonths } from "date-fns";

const STEPS = ["Thông tin sinh viên", "Học kỳ hiện tại"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  const DEFAULT_FORM_VALUES: SettingFormValues = {
    university: "",
    major: "",
    cohort: "",
    termId: null,
    yearId: null,
    startDate: new Date(),
    endDate: addMonths(new Date(), 1),
    admissionYear: null,
  };

  const formMethods = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const updateStudentInfo = useMutation({
    ...settingStudentInfoMutation(),
  });

  const onSubmit: SubmitHandler<SettingFormValues> = async (dto) => {
    try {
      // 3. Đổi thành mutateAsync để có thể dùng await và bắt lỗi bằng try...catch
      await updateStudentInfo.mutateAsync({
        body: {
          university: dto.university,
          major: dto.major,
          cohort: dto.cohort,
          termId: Number(dto.termId),
          yearId: Number(dto.yearId),
          startDate: dto.startDate.toISOString(),
          endDate: dto.endDate.toISOString(),
          admissionYear: Number(dto.admissionYear),
        },
      });
      // Sau khi cập nhật thành công, invalidate query để refetch lại thông tin người dùng
      queryClient.invalidateQueries({
        queryKey: getProfileQueryKey(),
      });

      // 4. Gọi API thành công thì nhảy sang bước 3 (Hiện màn hình Hoàn tất)
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to update student info:", error);
      // Ở đây bác có thể thêm toast thông báo lỗi cho user
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await formMethods.trigger(["university", "major", "cohort"]);
    }

    if (isValid) {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold">
          Chào mừng đến với SmartStudy!
        </h1>
        <p className="text-muted-foreground">
          Để bắt đầu, hãy thiết lập thông tin học tập của bạn.
        </p>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} className="mb-4" />
      {currentStep <= 2 ? (
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {currentStep === 1 && <Step1Personal />}

            {currentStep === 2 && (
              <Step2Program />
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 1}
              >
                Quay lại
              </Button>

              {currentStep < STEPS.length && (
                <Button type="button" onClick={handleNextStep}>
                  Tiếp tục
                </Button>
              )}
              {currentStep === STEPS.length && (
                <Button type="submit">Xác nhận & hoàn tất</Button>
              )}
            </div>
          </form>
        </FormProvider>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Thiết lập hoàn tất!</h2>
            <p className="text-muted-foreground">
              Bạn đã hoàn tất thiết lập thông tin học tập. Hãy bắt đầu khám phá
              SmartStudy và lên kế hoạch học tập của bạn nào!
            </p>
            <Button onClick={() => navigate("/app")}>
              Đến trang kế hoạch học tập
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
