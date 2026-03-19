namespace SmartStudy.Server.Constants
{
    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int PageIndex { get; set; } = 0; // Mặc định là trang 1

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value; // Chống user truyền pageSize = 1 triệu làm sập server
        }

        public string? SearchTerm { get; set; }
    }
}
