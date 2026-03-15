using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities;

public class TagLink: BaseEntity
{
    public int TagId  { get; set; }
    public Tag Tag { get; set; }
    public int LinkedId { get; set; }
    public TagLinkedType LinkedType { get; set; }
}