using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings
{
    public class UserMapping: IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<UserSettingDto, User>()
                .Ignore(dest => dest.Semesters);
              
        }
    }
}
