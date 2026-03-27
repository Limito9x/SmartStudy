// useChatRuntime.ts
import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
  type AppendMessage,
} from "@assistant-ui/react";
import { useRef, useState, useCallback, useEffect } from "react";

interface UseChatRuntimeProps {
  sessionId?: number; // Có thể truyền vào sessionId để load lịch sử, hoặc không truyền để bắt đầu mới
  courseId?: number; // ID khóa học, dùng khi tạo session mới
  onSessionCreated?: (sessionId: number) => void; // Callback khi session mới được tạo
}

export function useChatRuntime({
  sessionId,
  courseId,
  onSessionCreated,
}: UseChatRuntimeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<ThreadMessageLike[]>([]);
  const messagesRef = useRef<ThreadMessageLike[]>([]);
  const token = localStorage.getItem("token");

  // Load history khi có sessionId
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      messagesRef.current = [];
      return;
    }

    fetch(`http://localhost:5037/api/chat/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((history) => {
        const mapped = history.map((m: any) => ({
          role: m.role,
          content: [{ type: "text", text: m.content }],
        }));
        messagesRef.current = mapped;
        setMessages(mapped);
      });
  }, [sessionId, token]);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const userText = message.content
        .filter((c) => c.type === "text")
        .map((c: any) => c.text)
        .join("");

      // Cập nhật UI ngay lập tức cho user thấy
      const userMsg: ThreadMessageLike = {
        role: "user",
        content: [{ type: "text", text: userText }],
      };
      messagesRef.current = [...messagesRef.current, userMsg];
      setMessages([...messagesRef.current]);
      setIsRunning(true);

      let targetSessionId = sessionId;

      try {
        // MA THUẬT Ở ĐÂY: NẾU CHƯA CÓ SESSION, TẠO MỚI NGAY LẬP TỨC
        if (!targetSessionId) {
          const createRes = await fetch(
            `http://localhost:5037/api/chat/sessions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ title: "New Chat", courseId: courseId }),
            },
          );
          const createData = await createRes.json();
          targetSessionId = createData.id;
          onSessionCreated?.(Number(targetSessionId));
        }

        // Bắt đầu Stream với ID vừa có (hoặc ID cũ)
        const response = await fetch(
          `http://localhost:5037/api/chat/sessions/${targetSessionId}/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt: userText }),
          },
        );

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let aiText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const chunk = JSON.parse(data);
              if (chunk.Type === "Text" && chunk.Content) {
                aiText += chunk.Content;
                const assistantMsg: ThreadMessageLike = {
                  role: "assistant",
                  content: [{ type: "text", text: aiText }],
                };

                const prev = messagesRef.current;
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  messagesRef.current = [...prev.slice(0, -1), assistantMsg];
                } else {
                  messagesRef.current = [...prev, assistantMsg];
                }
                setMessages([...messagesRef.current]);
              }
            } catch {}
          }
        }
      } finally {
        setIsRunning(false);
      }
    },
    [sessionId, courseId, token],
  );

  return useExternalStoreRuntime({
    messages,
    isRunning,
    onNew,
    convertMessage: useCallback((msg: ThreadMessageLike) => msg, []),
  });
}
