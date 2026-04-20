// useChatRuntime.ts
import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
  type AppendMessage,
} from "@assistant-ui/react";
import { useRef, useState, useCallback, useEffect } from "react";

type ToolEnvelope = {
  tool?: string;
  summary?: string;
  records?: unknown[];
};

type CalendarContextRecord = {
  horizonDays?: number;
  events?: Array<{
    title?: string;
    startAt?: string;
    endAt?: string;
    courseName?: string;
    isVirtual?: boolean;
  }>;
};

type GraphInsightsRecord = {
  bottleneck_phases?: Array<{ phase_title?: string; pending_tasks?: number }>;
  upcoming_milestones?: Array<{ task_name?: string; end_datetime?: string }>;
  low_comprehension_tasks?: Array<{
    task_name?: string;
    comprehension_score?: number;
  }>;
};

type PhasePreviewRecord = {
  phase?: {
    title?: string;
    type?: string;
    priority?: string | number;
    startDateTime?: string;
    endDateTime?: string;
    notes?: string;
    rationale?: string;
  };
  suggestedTasks?: Array<{
    name?: string;
    type?: string;
    startDateTime?: string;
    endDateTime?: string;
  }>;
  suggestedStudyWindows?: Array<{
    startAt?: string;
    endAt?: string;
    reason?: string;
  }>;
  contextSummary?: string;
};

const JSON_OBJECT_RE = /^\s*\{[\s\S]*\}\s*$/;

function toToolEnvelope(rawText: string): ToolEnvelope | null {
  if (!JSON_OBJECT_RE.test(rawText)) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawText) as ToolEnvelope;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.tool !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function formatToolOutput(rawText: string): string {
  const envelope = toToolEnvelope(rawText);
  if (!envelope?.tool) {
    return rawText;
  }

  if (envelope.tool === "get_calendar_context") {
    const record = (envelope.records?.[0] ??
      null) as CalendarContextRecord | null;
    if (!record) {
      return envelope.summary ?? rawText;
    }

    const events = record.events ?? [];
    const eventLines = events.slice(0, 5).map((event, index) => {
      const virtualTag = event.isVirtual ? " (virtual)" : "";
      return `${index + 1}. ${event.title ?? "Sự kiện"}${virtualTag} - ${event.startAt ?? "N/A"}`;
    });

    return [
      "## Calendar Context",
      envelope.summary ?? "",
      `- Horizon: ${record.horizonDays ?? 0} ngày`,
      `- Tổng sự kiện: ${events.length}`,
      "",
      "### Sự kiện sắp tới",
      ...(eventLines.length > 0 ? eventLines : ["Không có sự kiện nào."]),
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (envelope.tool === "get_learning_progress") {
    const record =
      (envelope.records?.[0] as Record<string, unknown> | undefined) ?? {};
    return [
      "## Learning Progress",
      envelope.summary ?? "",
      `- Môn: ${String(record.course_name ?? "N/A")}`,
      `- Tiến độ: ${String(record.progress_percent ?? 0)}%`,
      `- Hoàn thành: ${String(record.completed_tasks ?? 0)}/${String(record.total_tasks ?? 0)} task`,
      `- Thời lượng log: ${String(record.total_logged_duration ?? 0)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (envelope.tool === "get_graph_insights") {
    const record = (envelope.records?.[0] ??
      null) as GraphInsightsRecord | null;
    if (!record) {
      return envelope.summary ?? rawText;
    }

    const bottleneckLines = (record.bottleneck_phases ?? [])
      .slice(0, 3)
      .map(
        (item, index) =>
          `${index + 1}. ${item.phase_title ?? "Phase"} - ${item.pending_tasks ?? 0} task pending`,
      );

    const milestoneLines = (record.upcoming_milestones ?? [])
      .slice(0, 3)
      .map(
        (item, index) =>
          `${index + 1}. ${item.task_name ?? "Milestone"} - ${item.end_datetime ?? "N/A"}`,
      );

    const comprehensionLines = (record.low_comprehension_tasks ?? [])
      .slice(0, 3)
      .map(
        (item, index) =>
          `${index + 1}. ${item.task_name ?? "Task"} - score ${item.comprehension_score ?? 0}`,
      );

    return [
      "## Graph Insights",
      envelope.summary ?? "",
      "",
      "### Phase nghẽn",
      ...(bottleneckLines.length > 0
        ? bottleneckLines
        : ["Không phát hiện phase nghẽn."]),
      "",
      "### Milestone gần hạn",
      ...(milestoneLines.length > 0
        ? milestoneLines
        : ["Không có milestone gần hạn."]),
      "",
      "### Task cần củng cố",
      ...(comprehensionLines.length > 0
        ? comprehensionLines
        : ["Không phát hiện task có tín hiệu hiểu bài thấp."]),
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (envelope.tool === "suggest_phase_preview") {
    const record = (envelope.records?.[0] ?? null) as PhasePreviewRecord | null;
    if (!record?.phase) {
      return envelope.summary ?? rawText;
    }

    const taskLines = (record.suggestedTasks ?? [])
      .slice(0, 5)
      .map(
        (task, index) =>
          `${index + 1}. ${task.name ?? "Task"} (${task.type ?? "N/A"}) - ${task.startDateTime ?? "N/A"}`,
      );

    const windowLines = (record.suggestedStudyWindows ?? [])
      .slice(0, 3)
      .map(
        (window, index) =>
          `${index + 1}. ${window.startAt ?? "N/A"} -> ${window.endAt ?? "N/A"} (${window.reason ?? "N/A"})`,
      );

    return [
      "## Phase Preview",
      envelope.summary ?? "",
      `- Title: ${record.phase.title ?? "N/A"}`,
      `- Type: ${record.phase.type ?? "N/A"}`,
      `- Priority: ${String(record.phase.priority ?? "N/A")}`,
      `- Start: ${record.phase.startDateTime ?? "N/A"}`,
      `- End: ${record.phase.endDateTime ?? "N/A"}`,
      record.phase.notes ? `- Notes: ${record.phase.notes}` : "",
      record.phase.rationale ? `- Rationale: ${record.phase.rationale}` : "",
      record.contextSummary ? `- Context: ${record.contextSummary}` : "",
      "",
      "### Suggested Tasks",
      ...(taskLines.length > 0 ? taskLines : ["Khong co task goi y."]),
      "",
      "### Suggested Study Windows",
      ...(windowLines.length > 0
        ? windowLines
        : ["Khong co khung gio trong phu hop."]),
      "",
      "Neu dong y voi de xuat nay, ban co the yeu cau toi tao phase tu preview nay.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return rawText;
}

interface UseChatRuntimeProps {
  sessionId?: number; // Có thể truyền vào sessionId để load lịch sử, hoặc không truyền để bắt đầu mới
  courseId?: number; // ID khóa học, dùng khi tạo session mới
  selectedAssetIds?: number[];
  onSessionCreated?: (sessionId: number) => void; // Callback khi session mới được tạo
}

export function useChatRuntime({
  sessionId,
  courseId,
  selectedAssetIds = [],
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
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Load chat history failed: ${r.status}`);
        }
        return r.json();
      })
      .then((history) => {
        if (!Array.isArray(history)) {
          throw new Error("History payload is not an array");
        }
        const mapped: ThreadMessageLike[] = history.map((m: any) => ({
          role: (m.role ?? m.Role) === "assistant" ? "assistant" : "user",
          content: [
            {
              type: "text" as const,
              text:
                typeof (m.content ?? m.Content) === "string"
                  ? (m.content ?? m.Content)
                  : "",
            },
          ],
        }));
        messagesRef.current = mapped;
        setMessages(mapped);
      })
      .catch((error) => {
        console.error("Load chat history error:", error);
        messagesRef.current = [];
        setMessages([]);
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

          if (!createRes.ok) {
            throw new Error(`Create session failed: ${createRes.status}`);
          }

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
            body: JSON.stringify({
              prompt: userText,
              selectedAssetIds,
            }),
          },
        );

        if (!response.ok || !response.body) {
          throw new Error(`Stream request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
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
              const type = chunk.Type || chunk.type;
              const content = chunk.Content || chunk.content;
              if (type && type.toLowerCase() === "text" && content) {
                aiText += content;
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

        if (aiText) {
          const formatted = formatToolOutput(aiText);
          if (formatted !== aiText) {
            const assistantMsg: ThreadMessageLike = {
              role: "assistant",
              content: [{ type: "text", text: formatted }],
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
        }
      } finally {
        setIsRunning(false);
      }
    },
    [sessionId, courseId, selectedAssetIds, token, onSessionCreated],
  );

  return useExternalStoreRuntime({
    messages,
    isRunning,
    onNew,
    convertMessage: useCallback((msg: ThreadMessageLike) => msg, []),
  });
}
