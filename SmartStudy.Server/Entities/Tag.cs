using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities;


public class Tag: BaseEntity 
{
    public int Id { get; set; }
    public string  Name { get; set; }
    public TagType Type { get; set; }
    public string[] Aliases { get; set; } = Array.Empty<string>();
}