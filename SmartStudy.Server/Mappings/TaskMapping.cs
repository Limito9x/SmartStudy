using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings;

public class TaskMapping: IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<LogWorkDto, LogItem>()
            .Map(dest => dest.ActualDuration, src => src.ActualDuration);
    }
}