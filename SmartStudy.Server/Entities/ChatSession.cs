namespace SmartStudy.Server.Entities
{
    public class ChatSession: BaseEntity
    {
        public string Title { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        ICollection<ChatMessage>? ChatMessages { get; set; }
    }
}
