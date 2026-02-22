import RangePicker from "@/components/ui/custom/range-picker";
import type { ResponseSemesterDto } from "@/services/api";
import { semesterService } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function SchoolStudyPage() {
  const [semesters, setSemesters] = useState<ResponseSemesterDto[]>([]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await semesterService.apiSemestersGet();
        setSemesters(response.data);
      }
      catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };

    fetchSemesters();
  }, []);

  console.log("Semesters:", semesters);

  return (
    <div>
      <h1>School Study Page</h1>
    </div>
  );
}