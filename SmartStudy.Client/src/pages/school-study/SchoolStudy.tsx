import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useDialogStore } from "@/stores/useDialogStore";
import { semesterService } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ResponseSemesterDto } from "@/services/api";
import { SemesterForm } from "@/components/forms/semester";

export default function SchoolStudyPage() {
  const [selectedSemester, setSelectedSemester] =
    useState<ResponseSemesterDto | null>(null);

  const { openDialog, closeDialog } = useDialogStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const response = await semesterService.apiSemestersGet();
      return response.data;
    },
  });

  console.log("Semesters:", data);

  const handleOpenDialog = () => {
    openDialog({
      title: "Thêm học kỳ mới",
      view: <SemesterForm onSuccess={() => closeDialog()} />,
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedSemester(data[0]);
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleOpenDialog}>
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm học kỳ mới</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
