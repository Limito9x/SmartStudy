using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings
{
    public class TimelineEventMapping : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RequestTimelineEventDto, TimelineEvent>()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            config.NewConfig<TimelineEvent, ResponseTimelineEventDto>();
        }
    }
}

