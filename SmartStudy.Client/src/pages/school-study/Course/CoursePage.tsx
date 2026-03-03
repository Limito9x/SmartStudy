import { useParams } from "react-router-dom";
import { getCourseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItemProps{
  label: string;
  value: string;
  content: React.ReactNode;
}

const TabItems: TabItemProps[] = [
  {
    label: "Điểm số",
    value: "grades",
    content: <div>Điểm số của môn học</div>,
  },
  {
    label: "Tài liệu",
    value: "assets",
    content: <div>Tài liệu của môn học</div>,
  },
  {
    label: "Công việc",
    value: "tasks",
    content: <div>Công việc của môn học</div>,
  },
  {
    label: "Lịch trình",
    value: "routine",
    content: <div>Lịch trình của môn học - tự động tạo công việc</div>,
  }
]

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await getCourseById({ path: { CourseId: courseId } });
      return response.data;
    },
    enabled: !!courseId,
  });

  return (
    <div className="p-4">
      {isLoading && <p>Loading course...</p>}
      {error && <p>Error loading course: {error.message}</p>}
      {course && (
        <div>
          <h1 className="text-2xl font-bold mb-4">{course.name}</h1>
          <Tabs defaultValue="grades" className="w-full">
            <TabsList className="bg-transparent border-b-2 mb-4">
              {TabItems.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TabItems.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
