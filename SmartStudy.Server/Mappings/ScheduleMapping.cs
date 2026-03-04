using Mapster;
using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Mappings
{
    public class ScheduleMapping: IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Map Entities.Schedule -> ResponseScheduleDto
            config.NewConfig<Entities.Schedule, ScheduleResponseDto>()
                .Map(dest => dest.StartHour, src => src.StartTime.Hour)
                .Map(dest => dest.StartMinute, src => src.StartTime.Minute);
        }
    }
}
