namespace SmartStudy.Server.Entities;

public class AcademicYear
{
    public int Id { get; set; }
    public int StartYear { get; set; }
    public int EndYear { get; set; }
    public string Name { get; set; } = "";
}