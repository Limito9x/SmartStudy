import { SidebarTrigger } from "@/components/ui/sidebar";
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 bg-background border-b">
      <div className="flex items-center gap-2 h-14 px-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">SmartStudy</h1>
      </div>
    </header>
  );
}
