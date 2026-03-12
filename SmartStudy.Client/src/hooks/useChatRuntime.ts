import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
  type AppendMessage,
} from "@assistant-ui/react";
import { useRef, useState, useCallback } from "react";

export function useChatRuntime(sessionId: number) {
  const [isRunning, setIsRunning] = useState(false);
  const messagesRef = useRef<ThreadMessageLike[]>([]);
  const [messages, setMessages] = useState<ThreadMessageLike[]>([]);
  const token = localStorage.getItem("token");
  const historyLoadedRef = useRef<number | null>(null);

  // Load history (using ref to avoid duplicate loads)
  if (sessionId && historyLoadedRef.current !== sessionId) {
    historyLoadedRef.current = sessionId;
    fetch(`http://localhost:5037/api/chat/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((history: { role: string; content: string }[]) => {
        const mapped: ThreadMessageLike[] = history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: [{ type: "text" as const, text: m.content }],
        }));
        messagesRef.current = mapped;
        setMessages(mapped);
      });
  }

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const userText = message.content
        .filter((c) => c.type === "text")
        .map((c) => (c as { type: "text"; text: string }).text)
        .join("");

      const userMsg: ThreadMessageLike = {
        role: "user",
        content: [{ type: "text", text: userText }],
      };
      messagesRef.current = [...messagesRef.current, userMsg];
      setMessages([...messagesRef.current]);
      setIsRunning(true);

      let aiText = "";

      try {
        const response = await fetch(
          `http://localhost:5037/api/chat/sessions/${sessionId}/stream`,
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

                // Replace last assistant message or append new one
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
    [sessionId, token],
  );

  const convertMessage = useCallback(
    (msg: ThreadMessageLike): ThreadMessageLike => msg,
    [],
  );

  return useExternalStoreRuntime({
    messages,
    isRunning,
    onNew,
    convertMessage,
  });
}
