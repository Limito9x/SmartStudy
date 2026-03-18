namespace SmartStudy.Server.Dtos;

public class KpiSummaryDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersThisWeek { get; set; }
    public double TotalSystemHours { get; set; }
    public int TotalCompletedTasks { get; set; }
}

public class UserGrowthChartDto
{
    public string Date { get; set; } = string.Empty;
    public int NewUsers { get; set; }
}

public class BehaviorChartDto
{
    public string TaskType { get; set; } = string.Empty;
    public double TotalHours { get; set; }
}

public class UserAdminDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public double TotalStudyHours { get; set; }
}
