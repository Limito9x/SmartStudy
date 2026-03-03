import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getApiSemesters } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type ResponseSemesterDto } from "@/services/api";
import CourseList from "@/components/features/school-study/course/CourseList";
import { CourseForm } from "@/components/forms/course";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";

export default function SchoolStudyPage() {
  const [selectedSemester, setSelectedSemester] =
    useState<ResponseSemesterDto | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const response = await getApiSemesters();
      return response.data;
    },
  });

  const { openDialog, closeDialog } = useDialogStore();

  const handleAddCourse = () => {
    if (!selectedSemester) return;
    openDialog({
      title: `Thêm lớp học phần cho ${selectedSemester.name}`,
      view: (
        <CourseForm
          semesterId={Number(selectedSemester.id)}
          onSuccess={closeDialog}
        />
      ),
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const activeSemester = data.find(
        (semester) => semester.status === "Active",
      );
      setSelectedSemester(activeSemester ?? null);
    }
  }, [data]);

  return (
    <div>
      <h1>Quản lý học kỳ</h1>
      {isLoading && <p>Loading semesters...</p>}
      {error && <p>Error loading semesters: {error.message}</p>}
      {data && (
        <div className="flex items-center gap-4">
          <Select
            value={selectedSemester?.id?.toString() ?? undefined}
            onValueChange={(val) => {
              const s = data.find((d) => d.id?.toString() === val) ?? null;
              setSelectedSemester(s);
            }}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Chọn học kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Học kỳ</SelectLabel>
                {data.map((semester) => (
                  <SelectItem
                    key={semester.id?.toString()}
                    value={semester.id.toString()}
                  >
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedSemester && (
        <Button onClick={handleAddCourse}>Thêm lớp học phần</Button>
      )}

      {selectedSemester && selectedSemester.courses && (
        <CourseList courses={selectedSemester.courses} />
      )}
    </div>
  );
}
