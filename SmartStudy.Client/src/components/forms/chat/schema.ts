import z from "zod";

export const ChatSessionSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
});

export type ChatSessionFormValues = z.infer<typeof ChatSessionSchema>;