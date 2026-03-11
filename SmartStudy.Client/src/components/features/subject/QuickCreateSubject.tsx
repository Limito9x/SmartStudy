import SubjectForm from "@/components/forms/subject/SubjectForm";
import { useSubject } from "@/hooks/entities/useSubject";
import { PlusIcon } from "lucide-react";
import { useState } from "react";



interface QuickCreateSubjectProps {
    name: string;
}

export default function QuickCreateSubject({ name }: QuickCreateSubjectProps) {
    const subjectApi = useSubject();
    const createSubjectMutation = subjectApi.createSubject;
    const [mode,setMode] = useState<"view" | "form">("view");

  if (mode === "view") {
    return (
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        onMouseDown={(e) => {
          e.preventDefault(); // tránh Popover đóng
          setMode("form");
        }}
      >
        <PlusIcon className="h-4 w-4" />
        Tạo môn "<span className="font-medium text-foreground">{name}</span>"
      </button>
    );
  }

  return (
    <div
      className="p-3"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }} // giữ Popover mở khi interact với form
    >
      <SubjectForm
        defaultValues={{ name, credits: 3, type: "Theory" }}
        onSubmit={async (values) => {
          await createSubjectMutation.mutateAsync({
            body: values
          });
          setMode("view");
        }}
        onCancel={()=>setMode("view")}
      />
    </div>
  );
}