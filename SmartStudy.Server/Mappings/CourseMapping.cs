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

            config.NewConfig<Course, SimpleResponseCourseDto>()
                .Map(dest => dest.Subject, src => src.Subject == null ?
                    null : src.Subject.Adapt<ResponseSubjectDto>());
        }
    }
}

