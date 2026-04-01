import { ArrowLeft, History, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Composer, Thread } from "@/components/thread";
import { useChatRuntime } from "@/hooks/useChatRuntime";
import { useChatSession } from "@/hooks/entities/useChatSession";
import { useChatStore } from "@/stores/useChatStore";

interface ChatContainerProps {
  courseId?: number | null;
}

export function ChatContainer({ courseId }: ChatContainerProps) {
  const {
    view,
    activeSessionId,
    setActiveSession,
  } = useChatStore();
  const effectiveCourseId = courseId ?? null;

  const runtime = useChatRuntime({
    sessionId: activeSessionId || undefined,
    courseId: effectiveCourseId || undefined,
    onSessionCreated: (sessionId) => setActiveSession(sessionId),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full w-full bg-slate-50">
        <div
          className="flex h-full flex-1 flex-col bg-white"
          style={{
            ["--composer-radius" as string]: "24px",
            ["--composer-padding" as string]: "10px",
          }}
        >
          {view === "list" ? (
            <ListMode courseId={effectiveCourseId} />
          ) : (
            <ThreadMode onBack={() => setActiveSession(null)} />
          )}
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

function ListMode({ courseId }: { courseId: number | null }) {
  return (
    <div className="flex h-full flex-col">
      <SessionList courseId={courseId} />
      <div className="border-t bg-slate-50 px-3 pb-3 pt-2 **:data-[slot=composer-shell]:shadow-sm">
        <Composer />
      </div>
    </div>
  );
}

function ThreadMode({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" onClick={onBack} title="Quay lại">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">Cuộc trò chuyện</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Thread />
      </div>
    </div>
  );
}

function SessionList({ courseId }: { courseId: number | null }) {
  const { activeSessionId, setActiveSession } = useChatStore();
  const { getAllChatSessions } = useChatSession();
  const { data: chatSessions, isLoading } = getAllChatSessions(
    courseId || undefined,
  );

  // Lọc an toàn hơn: ép về null nếu không có
  const filteredSessions =
    chatSessions?.filter((s) => (s.courseId || null) === (courseId || null)) ||
    [];

  return (
    <>
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-semibold text-sm">Lịch sử</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveSession(null)}
          title="Cuộc trò chuyện mới"
        >
          <SquarePen className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <p className="text-xs text-muted-foreground p-2 text-center">
            Đang tải...
          </p>
        )}

        {!isLoading && filteredSessions.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center">
            <History className="w-6 h-6 mb-2 opacity-20" />
            Chưa có lịch sử
          </div>
        )}

        {filteredSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveSession(Number(session.id))}
            className={`p-2 rounded-md text-sm cursor-pointer transition-colors line-clamp-1 ${
              activeSessionId === Number(session.id)
                ? "bg-blue-100 text-blue-700 font-medium"
                : "hover:bg-slate-200"
            }`}
          >
            {session.title || "Cuộc trò chuyện mới"}
          </div>
        ))}
      </div>
    </>
  );
}
