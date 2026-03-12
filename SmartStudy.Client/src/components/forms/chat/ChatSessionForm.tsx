import { ChatSessionSchema, type ChatSessionFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface ChatSessionFormProps {
  onSubmit: (values: ChatSessionFormValues) => void;
  defaultValues?: ChatSessionFormValues;
}

export default function ChatSessionForm({
  onSubmit,
  defaultValues = { title: "" },
}: ChatSessionFormProps) {
  return (
    <BaseForm
        schema={ChatSessionSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        children={(methods)=>(
            <>
            <FormInput
              name="title"
              label="Tiêu đề phiên chat"
                placeholder="Nhập tiêu đề cho phiên chat của bạn"
                control={methods.control}
            />
            <Button type="submit" className="mt-4">
              Tạo phiên chat
            </Button>
            </>
        )}
    />
  );
}