using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Chat;
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

        [HttpGet("sessions/{sessionId}")]
        public async Task<IActionResult> GetMessagesBySessionId(int sessionId)
        {
            try 
            {
                var messages = await _chatService.GetMessagesBySessionId(sessionId);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetAllSessions()
        {
            try 
            {
                var sessions = await _chatService.GetSessions();
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
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
                var collector = HttpContext.RequestServices.GetRequiredService<UIWidgetCollector>();
                collector.OnWidgetReceived += async (type, data) =>
                {
                    var widgetChunk = new AiResponseChunk
                    {
                        Type = "UI",
                        Data = data
                    };

                    var widgetJson = JsonSerializer.Serialize(widgetChunk, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    var sseWidgetMessage = $"data: {widgetJson}\n\n";
                    await Response.WriteAsync(sseWidgetMessage);
                    await Response.Body.FlushAsync();
                };
                await foreach (var text in _chatService.StreamChatAsync(sessionId, chatDto.prompt))
                {
                    // Serialize chunk thành JSON
                    var chunk = new AiResponseChunk
                    {
                        Type = "Text",
                        Content = text
                    };
                    var json = JsonSerializer.Serialize(chunk);
                    
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

        private Task Collector_OnWidgetReceived(string arg1, object arg2)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Create new chat session
        /// </summary>
        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] SessionDto sessionDto)
        {
            try 
            {
                await _chatService.CreateSession(sessionDto);
                return Ok(new { message = "Chat session created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
