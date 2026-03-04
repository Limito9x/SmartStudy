import { getApiSemesters, type SemesterStatus } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { type ResponseSemesterDto } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Outlet, useNavigate, useParams } from "react-router-dom";

type SemesterStatusMap = Record<
  SemesterStatus,
  {
    text: string;
    color: string;
  }
>;

export type SemesterOutletContext = {
  semesters: ResponseSemesterDto[] | undefined;
  currentSemester: ResponseSemesterDto | null;
};

const semesterStatusMap: SemesterStatusMap = {
  Active: { text: "Đang học", color: "bg-blue-500" },
  Past: { text: "Đã kết thúc", color: "bg-gray-500" },
  Future: { text: "Sắp tới", color: "bg-green-300" },
};

export default function SchoolStudyLayout() {
  const navigate = useNavigate();
  const { semesterId } = useParams<{ semesterId: string }>();

  const { data: semesters, isLoading } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const response = await getApiSemesters();
      return response.data;
    },
  });

  const currentSemester =
    semesters?.find((s) => s.id.toString() === semesterId) ?? null;

  const handleRedirectToSemester = (semester: ResponseSemesterDto) => {
    navigate(`/app/semesters/${semester.id}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <Select
              value={
                currentSemester ? currentSemester.id.toString() : undefined
              }
              onValueChange={(value) => {
                const selectedSemester = semesters?.find(
                  (s) => s.id.toString() === value,
                );
                if (selectedSemester) {
                  handleRedirectToSemester(selectedSemester);
                }
              }}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semesters?.map((semester) => {
                  const title = `HK${semester.term} - ${semester.year}`;
                  const statusInfo = semesterStatusMap[semester.status];
                  return (
                    <SelectItem
                      key={semester.id}
                      value={semester.id.toString()}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full mr-2 ${statusInfo.color}`}
                        ></span>
                        {title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Outlet context={{ semesters, currentSemester }} />
          </div>
        </>
      )}
    </div>
  );
}
