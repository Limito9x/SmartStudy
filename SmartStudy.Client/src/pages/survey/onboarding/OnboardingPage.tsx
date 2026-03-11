import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Stepper } from "@/components/ui/custom/stepper";
import { generateSemesters } from "@/utils/semesterGenerator";
import {
  settingSchema,
  type SettingFormValues,
} from "@/components/forms/user/student-info/schema";
import { type RequestStudyPlanDto } from "@/services/api";
import {
  patchApiUsersSettingStudentInfoMutation,
  bulkCreateStudyPlansMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import Step1Personal from "./Step1Personal";
import Step2Program from "./Step2Program";
import Step3Verification from "./Step3Verification";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const STEPS = ["Thông tin sinh viên", "Chương trình đào tạo", "Hoàn tất"];
const now = new Date();
const initialDate = new Date(
  now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1,
  8, // Tháng 9 (0-indexed)
  1,
);

const DEFAULT_FORM_VALUES: SettingFormValues = {
  admissionDate: initialDate,
  semestersPerYear: 3,
  weeksPerSemester: 16,
  weeksOfSummerSemester: 5,
  programLength: 4,
  university: "",
  major: "",
  cohort: "",
  totalRequiredCredits: undefined,
  creditsPerSemester: undefined,
  creditsPerSummerSemester: undefined,
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewPlans, setPreviewPlans] = useState<RequestStudyPlanDto[]>([]);

  const formMethods = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const [
    admissionDate,
    programLength,
    semestersPerYear,
    weeksPerSemester,
    weeksOfSummerSemester,
  ] = useWatch({
    control: formMethods.control,
    name: [
      "admissionDate",
      "programLength",
      "semestersPerYear",
      "weeksPerSemester",
      "weeksOfSummerSemester",
    ],
  });

  const updateStudentInfo = useMutation({
    ...patchApiUsersSettingStudentInfoMutation(),
  });

  const bulkCreateStudyPlans = useMutation({
    ...bulkCreateStudyPlansMutation(),
  });

  const onSubmit = async (data: SettingFormValues) => {
    try {
      console.log("Submitting data:", data);
      await updateStudentInfo.mutateAsync({
        body: {
          admissionDate: new Date(data.admissionDate).toISOString(),
          semestersPerYear: data.semestersPerYear,
          weeksPerSemester: data.weeksPerSemester,
          weeksOfSummerSemester: data.weeksOfSummerSemester,
          programLength: data.programLength,
          university: data.university,
          major: data.major,
          cohort: data.cohort,
          totalRequiredCredits: data.totalRequiredCredits ?? null,
          creditsPerSemester: data.creditsPerSemester ?? null,
          creditsPerSummerSemester: data.creditsPerSummerSemester ?? null,
        },
      });

      console.log("Student info updated successfully. Creating study plans...");
      await bulkCreateStudyPlans.mutateAsync({
        body: {
          studyPlans: previewPlans.map((plan) => ({
            academicTermId: plan.academicTermId,
            academicYearId: plan.academicYearId,
            startDate: new Date(plan.startDate).toISOString(),
            endDate: new Date(plan.endDate).toISOString(),
          })),
        },
      });

      console.log("Study plans created successfully. Redirecting...");
      setCurrentStep(4);
    } catch (error) {
      console.error("Error occurred while submitting data:", error);
      // Errors are surfaced via mutation.isError states
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await formMethods.trigger(["university", "major", "cohort"]);
    } else if (currentStep === 2) {
      isValid = await formMethods.trigger([
        "admissionDate",
        "semestersPerYear",
        "weeksPerSemester",
        "weeksOfSummerSemester",
        "programLength",
      ]);

      if (isValid) {
        const generatedPlans = generateSemesters({
          admissionDate: new Date(admissionDate),
          programLength: programLength,
          semestersPerYear: semestersPerYear,
          weeksPerSemester: weeksPerSemester,
          weeksOfSummerSemester: weeksOfSummerSemester,
        });
        setPreviewPlans(generatedPlans);
      }
    }

    if (isValid) {
      setCurrentStep((s) => s + 1);
    }
  };

  const isLoading =
    updateStudentInfo.isPending || bulkCreateStudyPlans.isPending;

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
      {currentStep <= 3 ? (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {currentStep === 1 && <Step1Personal />}

            {currentStep === 2 && <Step2Program />}

            {currentStep === 3 && (
              <Step3Verification previewPlans={previewPlans} />
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 1 || isLoading}
              >
                Quay lại
              </Button>

              {currentStep < STEPS.length && (
                <Button type="button" onClick={handleNextStep}>
                  Tiếp tục
                </Button>
              )}
              {currentStep === STEPS.length && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Xác nhận & Hoàn thành"}
                </Button>
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
            <Button onClick={() => navigate("/app/study-plans")}>
              Đến trang kế hoạch học tập
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
