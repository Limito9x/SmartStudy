using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Plugins;
using System.Text;
using System.Text.Json;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Services.AI;
using System.Runtime.CompilerServices;

namespace SmartStudy.Server.Services
{
    public interface IChatService
    {
        public Task<List<ChatHistoryDto>> GetMessagesBySessionId(int sessionId);
        public IAsyncEnumerable<AiResponseChunk> StreamChatAsync(int sessionId, string message,
        CancellationToken cancellationToken = default);
        public Task<int> CreateSession(SessionDto sessionDto);
        public Task<List<SessionResponseDto>> GetSessions(int? courseId);
    }
    
    public class ChatService: IChatService
    {
        private readonly Kernel _kernel;
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEmbeddingService _embeddingService;
        private readonly HttpClient _aiHttpClient;
        private readonly IConfiguration _configuration;

        public ChatService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            Kernel kernel,
            IMapper mapper,
            IConfiguration configuration,
            IEmbeddingService embeddingService,
            IServiceProvider serviceProvider,
            HttpClient aiHttpClient
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _kernel = kernel;
            _mapper = mapper;
            _serviceProvider = serviceProvider;
            _embeddingService = embeddingService;
            _aiHttpClient = aiHttpClient;
            _configuration = configuration;
        }

        public async Task<int> CreateSession(SessionDto sessionDto)
        {
            var session = _mapper.Map<Entities.ChatSession>(sessionDto);
            session.UserId = _currentUserService.UserId;
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            return session.Id;
        }

        public async Task<List<SessionResponseDto>> GetSessions(int? courseId)
        {
            int userId = _currentUserService.UserId;
            var query = _context.ChatSessions
                .Where(s => s.UserId == userId);
                
            if(courseId.HasValue)
            query = query.Where(s => s.CourseId == courseId.Value);
            
            var sessions = await query
                .OrderByDescending(s => s.UpdatedAt)
                .ToListAsync();
            
            return _mapper.Map<List<SessionResponseDto>>(sessions);
        }

        public async Task<List<ChatHistoryDto>> GetMessagesBySessionId(int sessionId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
            return _mapper.Map<List<ChatHistoryDto>>(messages);
        }

        public async Task InitializeChat(string firstMessage, int sessionId)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var kernel = scope.ServiceProvider.GetRequiredService<Kernel>();
                    var ai = kernel.GetRequiredService<IChatCompletionService>();

                    string titlePrompt = $"Ngay lập tức tạo tiêu đề ngắn (tối đa 5 từ) cho cuộc trò chuyện với câu hỏi này: '{firstMessage}'" +
                                         $"Tuyệt đối không đưa ra nhiều phương án, câu trả lời của bạn sẽ trở thành tiêu đề của cuộc trò chuyện, nên hãy trả lời thật ngắn gọn và súc tích. Nếu không thể tạo tiêu đề từ câu hỏi này, hãy trả lời 'Cuộc trò chuyện mới'";
                    var result = await ai.GetChatMessageContentAsync(titlePrompt);
                    string newTitle = result.Content ?? "Cuộc trò chuyện mới";

                    if (!string.IsNullOrEmpty(newTitle))
                    {
                        var session = await db.ChatSessions.FindAsync(sessionId);
                        if (session != null)
                        {
                            session.Title = newTitle;
                            await db.SaveChangesAsync();
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            });
        }

        public async IAsyncEnumerable<AiResponseChunk> StreamChatAsync(int sessionId, string message,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;
            
            var session = await _context.ChatSessions
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
                ?? throw new Exception("Chat session not found or access denied.");

            var courseId = session.CourseId;
            
            // 1. Load chat history từ database
            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new { role = m.Role, content = m.Content })
                .ToListAsync();

            if (messages.Count == 0)
            {
                Console.WriteLine("Khởi tạo trò chuyện, AI đặt tên session");
                await InitializeChat(message, sessionId);
            }

            // 2. Thêm system message TRƯỚC lịch sử
            var systemMsg = courseId.HasValue
                    ? AiPersonaConfig.GetCourseTutorPrompt(session.Course?.Name ?? "khóa học", courseId.Value)
                    : AiPersonaConfig.GetGlobalButlerPrompt();

            // 3. Gói dữ liệu sang Python
            var requestBody = new
            {
                query = message,
                history = messages,
                user_id = userId,
                system_prompt = systemMsg,
                course_id = courseId
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/chat");
            request.Content = JsonContent.Create(requestBody);
            request.Headers.Add("X-Internal-Service-Key", _configuration["InternalServiceKey"]);

            using var response = await _aiHttpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream);

            var fullTextResponse = new StringBuilder();
            var capturedUiData = "";

            // 5. Đọc stream từng dòng (chunk) từ Python trả về
            while (!reader.EndOfStream)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var line = await reader.ReadLineAsync(cancellationToken);
                if(string.IsNullOrWhiteSpace(line)) continue;

                AiResponseChunk? chunk = null;
                try
                {
                    chunk = JsonSerializer.Deserialize<AiResponseChunk>(line, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });
                }
                catch (Exception)
                {

                }

                if(chunk!=null)
                {
                    if (chunk.Type == "Text" && !string.IsNullOrEmpty(chunk.Content))
                    {
                        fullTextResponse.Append(chunk.Content);
                    }
                    // Tích lũy UI Data nếu AI sinh ra Component
                    else if (chunk.Type == "UI" && !string.IsNullOrEmpty(chunk.Data))
                    {
                        capturedUiData = chunk.Data; 
                    }

                    // Nhả (yield) từng khúc về cho Controller đẩy ra Frontend
                    yield return chunk;
                }
            }

            // 7. Lưu tin nhắn vào DB
            await SaveToDatabaseAsync(
                sessionId,
                message,
                fullTextResponse.ToString(),
                capturedUiData
            );
        }

        // Hàm phụ để lưu DB (Tách ra cho gọn)
        private async Task SaveToDatabaseAsync(int sessionId, string userMsg, string aiMsg, string uiData)
        {
            // Save User Msg
            _context.ChatMessages.Add(new Entities.ChatMessage{ SessionId = sessionId, Role = "user", Content = userMsg });

            JsonElement? uiJsonElement = null;
            if (!string.IsNullOrEmpty(uiData))
            {
                try
                {
                    using var doc = JsonDocument.Parse(uiData);
                    uiJsonElement = doc.RootElement.Clone(); // Clone để tránh bị dispose khi doc bị dispose sau khối using
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi phân tích cú pháp UI Data: {ex.Message}");
                }
            }

            // Save AI Msg
            var aiMessageEntity = new Entities.ChatMessage
            {
                SessionId = sessionId,
                Role = "assistant",
                Content = aiMsg,
                // Nếu có UI Data trong collector thì serialize lưu vào cột Data
                Data = uiJsonElement,
                Type = uiData.Any() ? MessageType.UI : MessageType.Text
            };

            _context.ChatMessages.Add(aiMessageEntity);
            await _context.SaveChangesAsync();
        }

    }
}
