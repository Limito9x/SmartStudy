using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Plugins;
using SmartStudy.Server.Services.UserService;
using System.Text;
using System.Text.Json;

namespace SmartStudy.Server.Services.Chat
{
    public interface IChatService
    {
        public Task<List<ChatHistoryDto>> GetMessagesBySessionId(int sessionId);
        public IAsyncEnumerable<string> StreamChatAsync(int sessionId, string message);
        public System.Threading.Tasks.Task CreateSession(SessionDto sessionDto);
        public Task<List<SessionResponseDto>> GetSessions();
    }
    
    public class ChatService: IChatService
    {
        private readonly Kernel _kernel;
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UIPlugin _uIPlugin;
        private readonly IMapper _mapper;
        private readonly UIWidgetCollector _uIWidgetCollector;

        public ChatService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            Kernel kernel,
            IMapper mapper,
            UIPlugin uIPlugin,
            UIWidgetCollector uIWidgetCollector
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _kernel = kernel;
            _mapper = mapper;
            _uIPlugin = uIPlugin;
            _uIWidgetCollector = uIWidgetCollector;
        }

        public async System.Threading.Tasks.Task CreateSession(SessionDto sessionDto)
        {
            var session = _mapper.Map<Entities.ChatSession>(sessionDto);
            session.UserId = _currentUserService.UserId;
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
        }

        public async Task<List<SessionResponseDto>> GetSessions()
        {
            int userId = _currentUserService.UserId;
            var sessions = await _context.ChatSessions
                .Where(s => s.UserId == userId)
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

        public async IAsyncEnumerable<string> StreamChatAsync(int sessionId, string message)
        {
            _uIWidgetCollector.Clear();

            if (!_kernel.Plugins.Contains("UIPlugin")) {
                _kernel.Plugins.AddFromObject(_uIPlugin, "UIPlugin");
                Console.WriteLine($"📌 Plugins registered: {string.Join(", ", _kernel.Plugins.Select(p => p.Name))}");
            }

            // 1. Load chat history từ database
            var dbMessages = _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new { m.Role, m.Content })
                .ToList();

            var history = new ChatHistory();

            // 2. Thêm system message TRƯỚC lịch sử
            history.AddSystemMessage(@"
    You are LifeOS AI.
    CRITICAL INSTRUCTION:
    If the user asks to create a Semester (e.g., 'Semester for IELTS', 'travel Semester'), you MUST NOT just describe it.
    You MUST call the 'RenderSemester' function with the detailed JSON data.
    
    Do NOT ask for confirmation. Just generate the Semester and call the function immediately.
");

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
        private async System.Threading.Tasks.Task SaveToDatabaseAsync(int sessionId, string userMsg, string aiMsg, List<object> uiData)
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
    }
}
