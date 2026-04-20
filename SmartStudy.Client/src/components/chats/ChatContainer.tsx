import { ArrowLeft, History, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Composer, Thread } from "@/components/thread";
import { useChatRuntime } from "@/hooks/useChatRuntime";
import { useChatSession } from "@/hooks/entities/useChatSession";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react";

interface ChatContainerProps {
  courseId?: number | null;
  selectedAssetIds?: number[];
  selectedAssetNames?: string[];
}

export function ChatContainer({
  courseId,
  selectedAssetIds = [],
  selectedAssetNames = [],
}: ChatContainerProps) {
  const { view, activeSessionId, setActiveSession } = useChatStore();
  const effectiveCourseId = courseId ?? null;
  const prevCourseIdRef = useRef<number | null>(effectiveCourseId);

  useEffect(() => {
    if (prevCourseIdRef.current === effectiveCourseId) {
      return;
    }

    prevCourseIdRef.current = effectiveCourseId;
    setActiveSession(null);
  }, [effectiveCourseId, setActiveSession]);

  const runtime = useChatRuntime({
    sessionId: activeSessionId || undefined,
    courseId: effectiveCourseId || undefined,
    selectedAssetIds,
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
            <ListMode
              courseId={effectiveCourseId}
              selectedAssetNames={selectedAssetNames}
            />
          ) : (
            <ThreadMode
              onBack={() => setActiveSession(null)}
              selectedAssetNames={selectedAssetNames}
            />
          )}
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

function ListMode({
  courseId,
  selectedAssetNames,
}: {
  courseId: number | null;
  selectedAssetNames: string[];
}) {
  return (
    <div className="flex h-full flex-col">
      <SelectedAssetsBanner selectedAssetNames={selectedAssetNames} />
      <SessionList courseId={courseId} />
      <div className="border-t bg-slate-50 px-3 pb-3 pt-2 **:data-[slot=composer-shell]:shadow-sm">
        <Composer />
      </div>
    </div>
  );
}

function ThreadMode({
  onBack,
  selectedAssetNames,
}: {
  onBack: () => void;
  selectedAssetNames: string[];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" onClick={onBack} title="Quay lại">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">Cuộc trò chuyện</span>
      </div>

      <SelectedAssetsBanner selectedAssetNames={selectedAssetNames} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <Thread />
      </div>
    </div>
  );
}

function SelectedAssetsBanner({
  selectedAssetNames,
}: {
  selectedAssetNames: string[];
}) {
  if (selectedAssetNames.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-emerald-50 px-3 py-2">
      <p className="text-xs font-medium text-emerald-900">
        Đang hỏi AI với {selectedAssetNames.length} tài liệu đã chọn:
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {selectedAssetNames.map((assetName, index) => (
          <span
            key={`${assetName}-${index}`}
            className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-900"
            title={assetName}
          >
            {assetName}
          </span>
        ))}
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
