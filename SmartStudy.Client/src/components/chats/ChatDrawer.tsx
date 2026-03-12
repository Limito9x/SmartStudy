// ChatDrawer.tsx
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/thread";
import { useChatRuntime } from "@/hooks/useChatRuntime";
import { useChatSession } from "@/hooks/entities/useChatSession";
import { useEffect } from "react";

export default function ChatDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle size={20} />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[400px] p-0 flex flex-col">
          <ChatPanel onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { getAllChatSessions, createChatSession } = useChatSession();
  const { data: chatSessions, isFetched } = getAllChatSessions;

  useEffect(() => {
    if (isFetched && (!chatSessions || chatSessions.length === 0)) {
      createChatSession.mutate({
        body: { title: `Chat ${new Date().toLocaleDateString("vi-VN")}` },
      });
    }
  }, [isFetched, chatSessions]);

  const sessionId = Number(chatSessions?.[0]?.id);

  if (!sessionId)
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Đang khởi tạo...</p>
      </div>
    );

  // Chỉ render khi sessionId có giá trị thật
  return <ChatPanelInner sessionId={sessionId} />;
}

// Tách ra component riêng — runtime chỉ tạo 1 lần với sessionId đúng
function ChatPanelInner({ sessionId }: { sessionId: number }) {
  const runtime = useChatRuntime(sessionId);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-semibold text-sm">Trợ lý SmartStudy</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
