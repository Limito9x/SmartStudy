using Microsoft.SemanticKernel;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Services.Chat;
using System.ComponentModel;
using System.Text.Json;
using System.Threading.Tasks;

namespace SmartStudy.Server.Plugins
{
    public class UIPlugin
    {
        private readonly UIWidgetCollector _uIWidgetCollector;
        public UIPlugin(UIWidgetCollector uIWidgetCollector)
        {
            _uIWidgetCollector = uIWidgetCollector;
            Console.WriteLine("UIPlugin initialized with UIWidgetCollector.");
        }

        [KernelFunction]
        [Description("Display Preview UI Detailed Semester for user")]
        public async Task<string> RenderSemester(
            [Description("The detailed Semester data to render")] SemesterUIData SemesterData
        )
        {
            Console.WriteLine($"Rendering Semester Preview UI Widget...,{SemesterData.Title}");

            var mappedSemester = UIDataHelper.ToSemesterDto(SemesterData);

            await _uIWidgetCollector.PushWidgetAsync("SemesterPreview", mappedSemester);

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            return JsonSerializer.Serialize(new
            {
                status = "rendered",
                SemesterSummary = $"Semester '{mappedSemester.Title}' with {mappedSemester.Courses.Count} Courses created."
            }, options);
        }
    }
}
