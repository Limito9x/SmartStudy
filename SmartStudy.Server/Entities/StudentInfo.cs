namespace SmartStudy.Server.Entities
{
    public class StudentInfo
    {
        // Id này vừa là Primary Key, vừa là Foreign Key trỏ tới AppUser.Id
        public int UserId { get; set; }
        public virtual User User { get; set; }

        // --- NHÓM 1: THÔNG TIN TRƯỜNG LỚP (Bổ sung sau) ---
        public string? University { get; set; }  // Trường (vd: Bách Khoa)
        public string? Major { get; set; }       // Ngành (vd: Khoa học Máy tính)
        public string? Cohort { get; set; }      // Khóa (vd: K65)

        // --- NHÓM 2: TÍN CHỈ (Để vẽ WBS & Tiến độ) ---
        public int? TotalRequiredCredits { get; set; }     // Tổng tín chỉ cần để ra trường (vd: 144)
        public int? CreditsPerSemester { get; set; } // Target mỗi kỳ (vd: 15)
        public int? CreditsPerSummerSemester { get; set; } // Target mỗi hè (vd: 6)

        // --- NHÓM 3: Câu hỏi Onboarding ---
        public DateTime AdmissionDate { get; set; }
        public int SemestersPerYear { get; set; }
        public int WeeksPerSemester { get; set; }
        public int? WeeksOfSummerSemester { get; set; }
        public float ProgramLength { get; set; }
    }
}
