namespace SmartStudy.Server.Entities.Interfaces
{
    public interface IHasId
    {
        public int Id { get; set; }
    }

    public interface IAuditable
    {
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public interface ISoftDeletable
    {
        public bool IsDeleted { get; }
        public DateTime? DeletedAt { get; set; }
    }
}
