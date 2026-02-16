namespace SmartStudy.Server.Entities.Enums
{
    public enum GoalType
    {
        Absolute, // Theo dõi trạng thái, chỉ số mỗi lần thực hiện
        Cumulative, // Cộng dồng tích lũy thêm mỗi lần thực hiện
        TaskBased // Dựa trên số lượng công việc đã hoàn thành
    }
}
