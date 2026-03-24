using System.Text.Json.Serialization;

namespace SmartStudy.Server.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StudyPlanStatus
    {
        Active,
        Completed,
        Archived
    }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StudyPlanType
    {
        Academic,
        Personal
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum CourseStatus
    {
        Enrolled,
        Completed,
        Dropped
    }
    
    public enum TagType
    {
        Major,
        University,
        Cohort,
        Semester
    }
    
    public enum TagLinkedType
    {
        User, // Ngữ cảnh sinh viên
        Subject, // Recommend môn học
        StudyPlan // Ngữ cảnh kế hoạch học tập
    }
}
