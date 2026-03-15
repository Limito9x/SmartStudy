using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Mappings;

public class LogMappinng: IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<LogItem, LogDto>()
            .Map(dest => dest.Productivity,
                src => StatisticHelper.CalculateProductivity(src, src.Task));
    }
}