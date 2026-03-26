#pragma warning disable SKEXP0050

using Microsoft.SemanticKernel.Text;
using Pgvector;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Services.AI;

namespace SmartStudy.Server.Services;

public interface IDocumentChunkService
{
    List<string> SplitMarkdownIntoChunks(string text, int maxTokensPerChunk = 500, int overlapTokens = 50);
    Task SaveChunksToDatabaseAsync(int assetId, List<string> chunks);
}

public class DocumentChunkService: IDocumentChunkService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IEmbeddingService _embeddingService;
    
    public DocumentChunkService(ApplicationDbContext dbContext, IEmbeddingService embeddingService)
    {
        _dbContext = dbContext;
        _embeddingService = embeddingService;
    }
    
    public List<string> SplitMarkdownIntoChunks(string text,int maxTokensPerChunk = 500, int overlapTokens = 50)
    {
        if(string.IsNullOrWhiteSpace(text))
            return new List<string>();

        var lines = TextChunker.SplitMarkDownLines(text, maxTokensPerLine: 100);

        var chunks = TextChunker.SplitMarkdownParagraphs(
            lines,
            maxTokensPerParagraph: maxTokensPerChunk,
            overlapTokens: overlapTokens);
        
        return chunks;
    }

    public async Task SaveChunksToDatabaseAsync(int assetId, List<string> chunks)
    {
        if (chunks == null||chunks.Count == 0) 
            return;
        
            var documentChunks = new List<DocumentChunk>();
            for (int i = 0; i < chunks.Count; i++)
            {
                var textChunk = chunks[i];
                
                var embeddingArray = await _embeddingService.GenerateEmbeddingAsync(textChunk);

                var entity = new DocumentChunk
                {
                    AssetId = assetId,
                    TextContent = textChunk,
                    Embedding = new Vector(embeddingArray),
                };
                
                documentChunks.Add(entity);

                if (i < chunks.Count - 1)
                {
                    await Task.Delay(500);
                }
            }
            await _dbContext.DocumentChunks.AddRangeAsync(documentChunks);
            await _dbContext.SaveChangesAsync();
    }
}