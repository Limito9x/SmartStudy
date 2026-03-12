import PublicHeader from "@/components/layout/public/public-header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, BrainCircuit, ArrowRight } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Quản lý môn học",
    description:
      "Tổ chức môn học, kế hoạch học tập và theo dõi tiến độ một cách khoa học.",
  },
  {
    icon: CalendarDays,
    title: "Lịch học thông minh",
    description:
      "Tự động sắp xếp thời khóa biểu, nhắc nhở deadline và lịch thi.",
  },
  {
    icon: BrainCircuit,
    title: "Trợ lý AI",
    description:
      "Chatbot AI hỗ trợ giải đáp thắc mắc và gợi ý phương pháp học hiệu quả.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Học tập hiệu quả hơn với{" "}
            <span className="text-primary">SmartStudy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Nền tảng quản lý học tập toàn diện — lên kế hoạch, theo dõi tiến độ
            và nhận hỗ trợ từ AI, tất cả trong một ứng dụng.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/login?mode=register")}>
              Bắt đầu miễn phí
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Tính năng nổi bật
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Mọi thứ bạn cần để quản lý việc học một cách thông minh.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-background p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SmartStudy. All rights reserved.
      </footer>
    </div>
  );
}
