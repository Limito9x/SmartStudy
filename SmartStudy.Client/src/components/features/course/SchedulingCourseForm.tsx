import { useForm, useFieldArray } from "react-hook-form";

export default function SchedulingCourseForm() {
    const {control} = useForm();
    const {fields} = useFieldArray({
        control,
        name: "courses"
    });

  return (
    
  );
}