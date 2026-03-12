namespace SmartStudy.Server.Entities
{
    public class ChatSession: BaseEntity
    {
        public string Title { get; set; }
        public int UserId { get; set; }
        ICollection<ChatMessage>? ChatMessages { get; set; }
    }
}
