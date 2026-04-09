using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Mappings
{
    public class StudyPlanMapping : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RequestStudyPlanDto, StudyPlan>()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);
        }
    }
}

