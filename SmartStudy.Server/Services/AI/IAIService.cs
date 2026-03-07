namespace SmartStudy.Server.Services
{
    public interface IAIService
    {
        Task<string> GenerateSemesterJSONAsync(string prompt);
    }
}
