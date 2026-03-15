using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities;

public class UnmatchedTerm: BaseSimpleEntity
{
    public string Term  { get; set; }
    public TagType  LinkedType  { get; set; }
    public int Count { get; set; } = 1;
    public bool IsProcessed { get; set; }
}