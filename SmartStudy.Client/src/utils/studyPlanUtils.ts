import type { ResponseStudyPlanDto } from "@/services/api";

// 1. THUẬT TOÁN TÌM PLAN MẶC ĐỊNH (Tâm lý: Mở app ra là thấy ngay hiện tại)
export const getAutoDefaultPlan = (plans: ResponseStudyPlanDto[]) => {
  if (!plans || plans.length === 0) return null;

  const now = new Date().getTime();

  // Ưu tiên 1: Đang diễn ra (Active + Hôm nay nằm giữa Start và End)
  const ongoing = plans.find((p) => {
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.endDate).getTime();
    return p.status === "Active" && start <= now && end >= now;
  });
  if (ongoing) return ongoing;

  // Ưu tiên 2: Sắp diễn ra (Active + Start trong tương lai) -> Lấy cái gần nhất
  const upcoming = plans
    .filter(
      (p) => p.status === "Active" && new Date(p.startDate).getTime() > now,
    )
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  if (upcoming.length > 0) return upcoming[0];

  // Ưu tiên 3: Nếu không có gì active/sắp tới, lấy cái vừa mới kết thúc gần đây nhất
  return plans.sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  )[0];
};

// 2. THUẬT TOÁN SẮP XẾP DROPDOWN (Gom nhóm và Sort)
export const sortStudyPlansForDropdown = (plans: ResponseStudyPlanDto[]) => {
  return [...plans].sort((a, b) => {
    // Ưu tiên 1: Thằng Active phải nằm trên thằng Completed/Archived
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (a.status !== "Active" && b.status === "Active") return 1;

    // Ưu tiên 2: Nếu cả 2 cùng Active, thằng nào mới tạo/mới bắt đầu lên trên
    if (a.status === "Active") {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }

    // Ưu tiên 3: Nếu là đồ cũ cất kho, thằng nào mới kết thúc gần đây lên trên
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });
};
