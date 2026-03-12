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
                .Ignore(dest => dest.SubjectId)
                .Ignore(dest => dest.Subject)
                .Ignore(dest => dest.StudyPlan)
                .IgnoreNullValues(true);

            config.NewConfig<Course, ResponseCourseDto>()
                .Map(dest => dest.SubjectName, src => src.Subject != null ? src.Subject.Name : string.Empty);
        }
    }
}

