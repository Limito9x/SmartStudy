using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings
{
    public class CourseMapping : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RequestCourseDto, Course>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.StudyPlan)
                .IgnoreNullValues(true);
            
        }
    }
}

