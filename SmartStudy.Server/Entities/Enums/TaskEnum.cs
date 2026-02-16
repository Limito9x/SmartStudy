namespace SmartStudy.Server.Entities.Enums
{
    public enum TaskType
    {
        Study, // Học bài, họp, v.v
        Exam,  // Thi cử, kiểm tra
        Assignment,
        Skill,
        Chores
    }

    public enum TaskStatus
    {
        Pending,
        Completed,
        Cancelled,
        Overdue
    }
}
