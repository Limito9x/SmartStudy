import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { BotIcon } from "lucide-react";
import { ChatContainer } from "./ChatContainer";

export default function BubbleChat() {
  const { isOpen, setOpen, open } = useChatStore();

  return (
    <AssistantModalPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <AssistantModalPrimitive.Trigger
        asChild
        className="fixed right-4 bottom-4 size-14"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => open()}
          className="rounded-full"
        >
          {isOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <BotIcon className="size-1 h-6 w-6" />
          )}
        </Button>
      </AssistantModalPrimitive.Trigger>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="h-125 w-100 overflow-hidden rounded-2xl border bg-popover shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <ChatContainer />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
}
