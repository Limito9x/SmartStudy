import { useLoadingStore } from "@/stores/useLoadingStore";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    // Lớp phủ đen mờ (Backdrop), chặn mọi thao tác click
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
        {/* Cục xoay xoay của Lucide */}
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        {/* Dòng chữ thông báo */}
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}