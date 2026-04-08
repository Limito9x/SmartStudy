using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services;
using System.Text.Json;

namespace SmartStudy.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController: ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet("sessions/{sessionId}", Name = "GetChatSessionById")]
        public async Task<ActionResult<List<ChatHistoryDto>>> GetMessagesBySessionId(int sessionId)
        {
            var messages = await _chatService.GetMessagesBySessionId(sessionId);
            return Ok(messages);
        }

        [HttpGet("sessions", Name = "GetAllChatSessions")]
        public async Task<ActionResult<List<SessionResponseDto>>> GetAllSessions(
            [FromQuery] int? courseId)
        {
            var sessions = await _chatService.GetSessions(courseId);
            return Ok(sessions);
        }

        /// <summary>
        /// Stream chat response với SSE (Server-Sent Events)
        /// </summary>
        [HttpPost("sessions/{sessionId}/stream")]
        public async Task StreamChat(int sessionId, [FromBody] ChatDto chatDto)
        {
            // Set headers cho SSE
            Response.Headers.Append("Content-Type", "text/event-stream");
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");

            try
            {
                await foreach (var chunk in _chatService.StreamChatAsync(sessionId, chatDto.prompt))
                {
                    // Serialize chunk thành JSON
                    var json = JsonSerializer.Serialize(chunk, new JsonSerializerOptions 
                    { 
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                    });
                    
                    // Format SSE: data: {json}\n\n
                    var sseMessage = $"data: {json}\n\n";
                    
                    // Write to response stream
                    await Response.WriteAsync(sseMessage);
                    await Response.Body.FlushAsync();
                }

                // Send completion event
                await Response.WriteAsync("data: [DONE]\n\n");
                await Response.Body.FlushAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatController] Error: {ex.Message}");
                
                // Send error event
                var errorChunk = new AiResponseChunk
                {
                    Type = "Error",
                    Content = "An error occurred while processing your request."
                };
                
                var errorJson = JsonSerializer.Serialize(errorChunk);
                await Response.WriteAsync($"data: {errorJson}\n\n");
                await Response.Body.FlushAsync();
            }
        }

        /// <summary>
        /// Create new chat session
        /// </summary>
        [HttpPost("sessions", Name = "CreateChatSession")]
        public async Task<IActionResult> CreateSession([FromBody] SessionDto sessionDto)
        {
            var sessionId = await _chatService.CreateSession(sessionDto);
            return Ok(new
            {
                id = sessionId,
                message = "Create session successfully!"
            });
        }
    }
}
