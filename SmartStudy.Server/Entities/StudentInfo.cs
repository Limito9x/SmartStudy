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
    }
}
