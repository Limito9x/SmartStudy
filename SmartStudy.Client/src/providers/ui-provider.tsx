import { TooltipProvider } from "@/components/ui/tooltip";

export function UIProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
