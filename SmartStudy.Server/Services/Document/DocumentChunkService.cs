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
    Task SaveChunksToDatabaseAsync(int assetId, List<ParsedPage> pages);
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

    public async Task SaveChunksToDatabaseAsync(int assetId, List<ParsedPage> pages)
    {
        if (pages == null || pages.Count == 0) 
            return;
        var documentChunks = new List<DocumentChunk>();
        foreach (var page in pages)
        {
            // 2. KHÂU CHUNK NẰM Ở ĐÂY: Băm riêng cái text của trang này thôi!
            var pageChunks = SplitMarkdownIntoChunks(page.markdown);

            // 3. Xử lý từng chunk của trang đó
            for (int i = 0; i < pageChunks.Count; i++)
            {
                var textChunk = pageChunks[i];

                // Đi xin Gemini 768 con số
                var embeddingArray = await _embeddingService.GenerateEmbeddingAsync(textChunk);

                // Đóng gói Entity (CÓ KÈM SỐ TRANG)
                var entity = new DocumentChunk
                {
                    AssetId = assetId,
                    PageNumber = page.page_number,
                    TextContent = textChunk,
                    Embedding = new Vector(embeddingArray) 
                };

                documentChunks.Add(entity);
                await Task.Delay(500); // Ngủ nửa giây chống spam API
            }
        }

            await _dbContext.DocumentChunks.AddRangeAsync(documentChunks);
            await _dbContext.SaveChangesAsync();
    }
}