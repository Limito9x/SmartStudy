using System.Threading.Channels;

namespace SmartStudy.Server.Services;

public class AssetQueueService
{
    private readonly Channel<int> _queue;
    
    public AssetQueueService()
    {
        var options = new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait, // Nếu đầy, API đợi 1 chút để hệ thống xử lý bớt
        };
        _queue = Channel.CreateBounded<int>(options);
    }
    
    // Đưa Id vào channel chờ xử lý
    public async ValueTask QueueAssetForProcessingAsync(int id)
    {
        await _queue.Writer.WriteAsync(id);
    }

    // Worker lắng nghe channel, trả về stream Id để xử lý
    public IAsyncEnumerable<int> ReadAllAsync(CancellationToken cancellationToken)
    {
        return _queue.Reader.ReadAllAsync(cancellationToken);
    }
}