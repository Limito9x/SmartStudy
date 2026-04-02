using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings;

public class CalendarMapping: IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Routine, UnscheduledItemDto>()
            .Map(dest => dest.PlannedDuration, src => 120)
            .Map(dest => dest.EntityType, src => CalendarEntityType.Routine)
            .Map(dest=>dest.CourseName, src => src.Course != null ? src.Course.Name : null)
            .Map(dest=>dest.CourseColor, src => src.Course != null ? src.Course.Color : null);
        
        config.NewConfig<TaskItem, UnscheduledItemDto>()
            .Map(dest => dest.PlannedDuration, src => src.EndDateTime.HasValue && src.StartDateTime.HasValue ? (int?)(src.EndDateTime.Value - src.StartDateTime.Value).TotalMinutes : 60)
            .Map(dest => dest.EntityType, src => CalendarEntityType.Task)
            .Map(dest => dest.CourseName, src => src.Course != null ? src.Course.Name : null)
            .Map(dest => dest.CourseColor, src => src.Course != null ? src.Course.Color : null);
    }
}