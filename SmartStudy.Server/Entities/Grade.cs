namespace SmartStudy.Server.Entities
{
    public class Grade: BaseEntity
    {
        public string Name { get; set; }
        public double Weight { get; set; } // Tổng các weight phải = 1.0 (100%)
        // Điểm số
        public double? ActualScore { get; set; } // Nullable: Chưa có điểm
        public double MaxScale { get; set; } = 10;
        public int CourseId { get; set; }
        public required Course Course { get; set; }
        public ICollection<TaskItem>? Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Routine>? Routines { get; set; } = new List<Routine>();
    }
}
