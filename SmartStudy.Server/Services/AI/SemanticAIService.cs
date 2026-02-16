using Microsoft.SemanticKernel; // Quan trọng
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Services.AI
{
    public class SemanticAIService : IAIService
    {
        private readonly Kernel _kernel;

        public SemanticAIService(Kernel kernel)
        {
            _kernel = kernel;
        }

        private string CleaningOutput(string input)
        {
            if (string.IsNullOrEmpty(input)) return "{}";

            var responseText = input.Trim();

            // Kỹ thuật "Clean Markdown": Xóa bỏ ```json và ```
            if (responseText.StartsWith("```json"))
            {
                responseText = responseText.Substring(7);
            }
            else if (responseText.StartsWith("```")) // Đôi khi nó chỉ trả về ```
            {
                responseText = responseText.Substring(3);
            }

            if (responseText.EndsWith("```"))
            {
                responseText = responseText.Substring(0, responseText.Length - 3);
            }

            return responseText.Trim();
        }

        public async Task<string> GenerateSemesterJSONAsync(string userInput)
        {

            //var today = DateTime.UtcNow;

            // Prompt engineering: Ép kiểu JSON chặt chẽ hơn
            var prompt = $@"
                Role: Expert Semesterner specialize in specific areas based on user requirements.
                Task: Create a detailed Semester for '{userInput}'.
                Constraint: Return ONLY raw JSON. No markdown.
                INSTRUCTION FOR DATES:
                - Instead of specific dates, use 'dayOffset' (integer).
                - 'dayOffset': 0 means start today, 1 means tomorrow, etc.
                - If a task has no deadline, set 'dayOffset' to null.
                - Calculate 'SemesterDurationDays' for the whole Semester.
                JSON Structure:
                {{
                    ""title"": ""string"",
                    ""description"": ""string"",
                    ""tasks"": [
                        {{ ""name"": ""string"", ""description"": ""string"", ""dayOffset"": ""integer?"" }}
                    ]
                }}
            ";

            var result = await _kernel.InvokePromptAsync(prompt);

            string responeseText = result?.ToString() ?? "{}";

            var cleanedJson = CleaningOutput(responeseText);

            return cleanedJson;
        }
    }
}