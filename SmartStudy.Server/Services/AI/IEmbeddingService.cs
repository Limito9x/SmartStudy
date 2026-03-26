namespace SmartStudy.Server.Services.AI;

public interface IEmbeddingService
{
    public Task<float[]> GenerateEmbeddingAsync(string text);
}