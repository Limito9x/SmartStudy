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
            .Map(dest => dest.EntityType, src => CalendarEntityType.Routine);
        
        config.NewConfig<TaskItem, UnscheduledItemDto>()
            .Map(dest => dest.PlannedDuration, src => src.PlannedDuration ?? 60)
            .Map(dest => dest.EntityType, src => CalendarEntityType.Task);
    }
}