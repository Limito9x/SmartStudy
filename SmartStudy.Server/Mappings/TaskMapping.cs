using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings;

public class TaskMapping: IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<TaskItem, CalendarTaskDto>()
            .Map(dest=>dest.Title, src => src.Name)
            .Map(dest=>dest.StartDate, src => src.TaskDate)    
            .Map(dest => dest.EndTime,
                src => src.StartTime!.Value.AddMinutes(src.DurationMinutes!.Value));
    }
}