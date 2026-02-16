using System.Text.Json;

namespace SmartStudy.Server.Services.Chat
{
    public class UIWidgetCollector
    {
        public event Func<string, object , System.Threading.Tasks.Task>? OnWidgetReceived;
        public List<object> CapturedData { get; private set; } = new();

        public async System.Threading.Tasks.Task PushWidgetAsync(string widgetType, object data)
        {
            CapturedData.Add(data);
            if (OnWidgetReceived != null)
            {
                // Truyền nguyên cục object sang cho Service/Controller xử lý
                await OnWidgetReceived.Invoke(widgetType, data);
            }
        }

        public void Clear() => CapturedData.Clear();
    }
}
