using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using System.Text;
using System.Text.Json;
using SmartStudy.Server.Helpers;
using System.Runtime.CompilerServices;
using SmartStudy.Server.Entities;
using CloudinaryDotNet.Actions;

namespace SmartStudy.Server.Services
{
    public interface IChatService
    {
        public Task<List<ChatHistoryDto>> GetMessagesBySessionId(int sessionId);
        public IAsyncEnumerable<AiResponseChunk> StreamChatAsync(int sessionId, string message,
        List<int>? selectedAssetIds = null,
        CancellationToken cancellationToken = default);
        public Task<int> CreateSession(SessionDto sessionDto);
        public Task<List<SessionResponseDto>> GetSessions(int? courseId);
    }
    
    public class ChatService: IChatService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly IServiceProvider _serviceProvider;
        private readonly IAiApiClient _aiApiClient;

        public ChatService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper,
            IAiApiClient aiApiClient,
            IServiceProvider serviceProvider
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _serviceProvider = serviceProvider;
            _aiApiClient = aiApiClient;
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
            var userId = _currentUserService.UserId;

            var hasAccess = await _context.ChatSessions
                .AnyAsync(s => s.Id == sessionId && s.UserId == userId);

            if (!hasAccess)
            {
                throw new Exception("Chat session not found or access denied.");
            }

            var rawMessages = await _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return rawMessages
                .Select(m => new ChatHistoryDto(
                    m.Id,
                    m.Role,
                    m.Content,
                    m.Data.HasValue ? m.Data.Value.GetRawText() : null,
                    m.Type.ToString()
                ))
                .ToList();
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
        List<int>? selectedAssetIds = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;
            
            var session = await _context.ChatSessions
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
                ?? throw new Exception("Chat session not found or access denied.");

            var courseId = session.CourseId;
            var scopedSelectedAssetIds = await ResolveScopedSelectedAssetIdsAsync(
                userId,
                courseId,
                selectedAssetIds,
                cancellationToken);
            
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

            var course = _context.Courses.Find(courseId);

            // 2. Thêm system message TRƯỚC lịch sử
            var systemMsg = courseId.HasValue
                    ? AiPersonaConfig.GetCourseTutorPrompt(session.Course?.Name ?? "khóa học",
                    course != null ? course.Goal : "giúp đỡ người học tiến bộ mỗi ngày", course != null ? course.TargetScore : 0)
                    : AiPersonaConfig.GetGlobalButlerPrompt();

            var info = await _context.StudentInfos
                .Where(i => i.UserId == userId)
                .FirstOrDefaultAsync();

            var studentInfoStr = info != null
                ? $@"Thông tin sinh viên: 
                Trường: {info.University},
                Ngành: {info.Major},
                Khóa {info.Cohort}.
                Năm nhập học: {info.AdmissionYear}.
                Đây là những phần thông tin quan trọng của sinh viên để trợ lý AI có thể cá nhân hóa câu trả lời, nhưng chỉ sử dụng khi thực sự cần thiết để tránh lạc đề. Nếu không có thông tin này, hãy trả lời như bình thường."
                : "Không có thông tin sinh viên.";

            systemMsg += "\n\n" + studentInfoStr;

            if (scopedSelectedAssetIds.Count > 0)
            {
                var assets = await _context.Assets
                    .Where(a => scopedSelectedAssetIds.Contains(a.Id))
                    .Select(a => a.FileName)
                    .ToListAsync();
                systemMsg += $"\n\nPhạm vi tài liệu RAG cho truy vấn này đã được giới hạn vào {scopedSelectedAssetIds.Count} tài liệu do người dùng chọn.";
                systemMsg += "\nDanh sách tài liệu (chỉ tên file):\n" + string.Join("\n", assets);
            }

            // 3. Gói dữ liệu sang Python
            var requestBody = new ChatRequestDto
            {
                SystemPrompt = systemMsg,
                History = messages.Select(m => new ChatMessageDto { Role = m.role, Content = m.content }).ToList(),
                Query = message,
                CourseId = courseId,
                UserId = userId,
                SelectedAssetIds = scopedSelectedAssetIds.Count > 0 ? scopedSelectedAssetIds : null,
            };

            // Lưu user message trước khi gọi AI để tránh mất dữ liệu nếu stream lỗi giữa chừng.
            await SaveUserMessageAsync(sessionId, message, cancellationToken);

            // 4. Gọi API streaming của Python, nhận từng khúc (chunk) trả về và nhả (yield) về cho Controller đẩy ra Frontend ngay lập tức mà không cần đợi toàn bộ câu trả lời hoàn chỉnh
            var stream = await _aiApiClient.StreamingChatAsync(requestBody, cancellationToken);

            using var reader = new StreamReader(stream);

            var fullTextResponse = new StringBuilder();
            var capturedUiData = "";
            var capturedErrorText = "";

            try
            {
                string? line;
                while ((line = await reader.ReadLineAsync(cancellationToken)) != null)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var normalizedLine = line.Trim();
                    if (normalizedLine.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                        normalizedLine = normalizedLine[5..].Trim();
                    if (string.Equals(normalizedLine, "[DONE]", StringComparison.OrdinalIgnoreCase))
                        continue;

                    AiResponseChunk? chunk = null;
                    try
                    {
                        chunk = JsonSerializer.Deserialize<AiResponseChunk>(normalizedLine,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[WARN] Parse chunk lỗi: {ex.Message}");
                        continue;
                    }

                    if (chunk != null)
                    {
                        if (chunk.Type == "Text" && !string.IsNullOrEmpty(chunk.Content))
                            fullTextResponse.Append(chunk.Content);
                        else if (chunk.Type == "UI" && !string.IsNullOrEmpty(chunk.Data))
                            capturedUiData = chunk.Data;
                        else if (chunk.Type == "Error" && !string.IsNullOrEmpty(chunk.Content))
                            capturedErrorText = chunk.Content;

                        yield return chunk;
                    }
                }
            }
            finally
            {
                // Luôn lưu dù stream thành công, lỗi, hay client cancel
                var assistantMessage = fullTextResponse.Length > 0
                    ? fullTextResponse.ToString()
                    : capturedErrorText;

                if (!string.IsNullOrEmpty(assistantMessage) || !string.IsNullOrEmpty(capturedUiData))
                {
                    await SaveAssistantMessageAsync(
                        sessionId,
                        assistantMessage,
                        capturedUiData,
                        CancellationToken.None  // ← quan trọng
                    );
                }
            }
        }

        private async Task<List<int>> ResolveScopedSelectedAssetIdsAsync(
            int userId,
            int? courseId,
            List<int>? selectedAssetIds,
            CancellationToken cancellationToken)
        {
            if (selectedAssetIds == null || selectedAssetIds.Count == 0)
            {
                return [];
            }

            var normalizedSelectedIds = selectedAssetIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (normalizedSelectedIds.Count == 0)
            {
                return [];
            }

            var query = _context.Assets
                .AsNoTracking()
                .Where(a => normalizedSelectedIds.Contains(a.Id)
                            && a.UserId == userId
                            && a.Status == AssetStatus.Analyzed
                            && a.AssetLinks.Any());

            if (courseId.HasValue)
            {
                var targetCourseId = courseId.Value;
                query = query.Where(a => a.AssetLinks.Any(al =>
                    (al.LinkedType == AssetLinkType.Course && al.LinkedId == targetCourseId) ||
                    (al.LinkedType == AssetLinkType.Task && _context.Tasks.Any(t =>
                        t.Id == al.LinkedId &&
                        t.UserId == userId &&
                        t.Phase != null &&
                        t.Phase.CourseId == targetCourseId)) ||
                    (al.LinkedType == AssetLinkType.Log && _context.Logs.Any(l =>
                        l.Id == al.LinkedId &&
                        l.Task.UserId == userId &&
                        l.Task.Phase != null &&
                        l.Task.Phase.CourseId == targetCourseId))));
            }
            else
            {
                query = query.Where(a => a.AssetLinks.Any(al => al.UserId == userId));
            }

            var scopedIds = await query
                .Select(a => a.Id)
                .Distinct()
                .ToListAsync(cancellationToken);

            return scopedIds;
        }

        private async Task SaveUserMessageAsync(int sessionId, string userMsg, CancellationToken cancellationToken)
        {
            _context.ChatMessages.Add(new Entities.ChatMessage
            {
                SessionId = sessionId,
                Role = "user",
                Content = userMsg
            });
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Hàm phụ để lưu AI message
        private async Task SaveAssistantMessageAsync(int sessionId, string aiMsg, string uiData, CancellationToken cancellationToken)
        {

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
            await _context.SaveChangesAsync(cancellationToken);
        }

    }
}
