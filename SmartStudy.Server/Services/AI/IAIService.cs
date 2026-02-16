namespace SmartStudy.Server.Services.AI
{
    public interface IAIService
    {
        Task<string> GenerateSemesterJSONAsync(string prompt);
    }
}
