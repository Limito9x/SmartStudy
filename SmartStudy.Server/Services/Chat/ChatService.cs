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

namespace SmartStudy.Server.Services
{
    public interface IChatService
    {
        public Task<List<ChatHistoryDto>> GetMessagesBySessionId(int sessionId);
        public IAsyncEnumerable<string> StreamChatAsync(int sessionId, string message);
        public Task<int> CreateSession(SessionDto sessionDto);
        public Task<List<SessionResponseDto>> GetSessions(int? courseId);
        public Task<string> GetInsight(DashboardSummaryDto summaryDto);
    }
    
    public class ChatService: IChatService
    {
        private readonly Kernel _kernel;
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UIPlugin _uIPlugin;
        private readonly IMapper _mapper;
        private readonly UIWidgetCollector _uIWidgetCollector;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEmbeddingService _embeddingService;

        public ChatService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            Kernel kernel,
            IMapper mapper,
            UIPlugin uIPlugin,
            IEmbeddingService embeddingService,
            UIWidgetCollector uIWidgetCollector,
            IServiceProvider serviceProvider
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _kernel = kernel;
            _mapper = mapper;
            _uIPlugin = uIPlugin;
            _uIWidgetCollector = uIWidgetCollector;
            _serviceProvider = serviceProvider;
            _embeddingService = embeddingService;
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
                    var ai = scope.ServiceProvider.GetRequiredService<IChatCompletionService>();

                    string titlePrompt = $"Tạo tiêu đề ngắn (tối đa 10 từ) cho câu hỏi này: '{firstMessage}'";
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

        public async IAsyncEnumerable<string> StreamChatAsync(int sessionId, string message)
        {
            var userId = _currentUserService.UserId;
            _uIWidgetCollector.Clear();

            if (!_kernel.Plugins.Contains("UIPlugin")) {
                _kernel.Plugins.AddFromObject(_uIPlugin, "UIPlugin");
                Console.WriteLine($"📌 Plugins registered: {string.Join(", ", _kernel.Plugins.Select(p => p.Name))}");
            }
            
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
                ?? throw new Exception("Chat session not found or access denied.");

            var courseId = session.CourseId;
            
            // 1. Load chat history từ database
            var dbMessages = _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new { m.Role, m.Content })
                .ToList();

            if (dbMessages.Count == 0)
            {
                Console.WriteLine("Khởi tạo trò chuyện, AI đặt tên session");
                await InitializeChat(message, sessionId);
            }

            var history = new ChatHistory();

            // 2. Thêm system message TRƯỚC lịch sử
            var systemMsg = "";
            if (courseId.HasValue)
            {
                systemMsg = AiPersonaConfig.GetCourseTutorPrompt(courseTitle: session.Course?.Name ?? "khóa học", courseId: courseId.Value);
                var ragPlugin = new CourseRagPlugin(_context,_embeddingService, courseId.Value,userId);
                
                if(!_kernel.Plugins.Contains("CourseRagPlugin"))
                {
                    _kernel.Plugins.AddFromObject(ragPlugin, "CourseRagPlugin");
                    Console.WriteLine($"📌 Plugins registered: {string.Join(", ", _kernel.Plugins.Select(p => p.Name))}");
                }
            }
            else
            {
                systemMsg = AiPersonaConfig.GetGlobalButlerPrompt();
            }
            history.AddSystemMessage(systemMsg);

            // 3. Load lịch sử chat
            foreach (var msg in dbMessages)
            {
                if (msg.Role == "user")
                {
                    history.AddUserMessage(msg.Content);
                }
                else if (msg.Role == "assistant")
                {
                    history.AddAssistantMessage(msg.Content);
                }
            }

            // 4. Thêm tin nhắn mới của user
            history.AddUserMessage(message);

            // 5. Cấu hình settings
            var settings = new GeminiPromptExecutionSettings
            {
                ToolCallBehavior = GeminiToolCallBehavior.AutoInvokeKernelFunctions
            };

            var chatCompletion = _kernel.GetRequiredService<IChatCompletionService>();

            // 6. Stream response từ AI
            var streamingResult = chatCompletion.GetStreamingChatMessageContentsAsync(
                history,
                settings,
                _kernel
            );

            // Buffers để lưu trữ data
            var fullTextResponse = new StringBuilder();

            await foreach (var content in streamingResult)
            {
                // In ra console để debug xem nó có trả về Metadata tool call không
                if (content.Metadata != null && content.Metadata.ContainsKey("FunctionToolCalls"))
                {
                    Console.WriteLine("⚡ AI IS CALLING A TOOL!");
                }

                if (!string.IsNullOrEmpty(content.Content))
                {
                    fullTextResponse.Append(content.Content);
                    yield return content.Content;
                }
            }

            // 7. Lưu tin nhắn vào DB
            await SaveToDatabaseAsync(
                sessionId,
                message,
                fullTextResponse.ToString(),
                _uIWidgetCollector.CapturedData
            );
        }

        // Hàm phụ để lưu DB (Tách ra cho gọn)
        private async Task SaveToDatabaseAsync(int sessionId, string userMsg, string aiMsg, List<object> uiData)
        {
            // Save User Msg
            _context.ChatMessages.Add(new Entities.ChatMessage{ SessionId = sessionId, Role = "user", Content = userMsg });

            // Save AI Msg
            var aiMessageEntity = new Entities.ChatMessage
            {
                SessionId = sessionId,
                Role = "assistant",
                Content = aiMsg,
                // Nếu có UI Data trong collector thì serialize lưu vào cột Data
                Data = uiData.Any() ? JsonSerializer.SerializeToElement(uiData.First(), new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }) : null,
                Type = uiData.Any() ? MessageType.UI : MessageType.Text
            };

            _context.ChatMessages.Add(aiMessageEntity);
            await _context.SaveChangesAsync();
        }
        
        public async Task<string> GetInsight(DashboardSummaryDto summary)
        {
            var prompt = $"""
                          Bạn là trợ lý học tập. Phân tích dữ liệu và đưa ra 1-2 câu gợi ý ngắn gọn bằng tiếng Việt.
                          Không dùng bullet points. Tối đa 2 câu.

                          Dữ liệu tuần này:
                          - Giờ học: {summary.WeeklyStudyHours}h
                          - Năng suất: {summary.WeeklyProductivity}%
                          - Hoàn thành: {summary.WeeklyCompletionRate}% tasks
                          - Việc quá hạn: {summary.OverdueTasks.Count}
                          - Sự kiện sắp tới: {string.Join(", ", summary.UpcomingEvents
                              .Take(2)
                              .Select(e => $"{e.Title} còn {e.DaysUntil} ngày"))}
                          """;

            var chatCompletion = _kernel.GetRequiredService<IChatCompletionService>();
            var result = await chatCompletion.GetChatMessageContentAsync(prompt);
            return result.Content ?? "";
        }
    }
}
