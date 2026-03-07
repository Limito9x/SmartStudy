using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings
{
    public class StudyPlanMapping : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<RequestStudyPlanDto, StudyPlan>()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            config.NewConfig<StudyPlan, ResponseStudyPlanDto>()
                .Map(dest => dest.DisplayName, src =>
                    src.AcademicTerm != null && src.AcademicYear != null
                        ? $"{src.AcademicTerm.Name}, năm học {src.AcademicYear.StartYear} - {src.AcademicYear.EndYear}"
                        : $"StudyPlan {src.Id}"
                )
                .Map(dest => dest.Status, src =>
                    DateTime.UtcNow >= src.StartDate && DateTime.UtcNow <= src.EndDate ? StudyPlanStatus.Active :
                    DateTime.UtcNow < src.StartDate ? StudyPlanStatus.Future : StudyPlanStatus.Past
                );

            config.NewConfig<StudyPlan, SimpleResponseStudyPlanDto>()
                .Map(dest => dest.DisplayName, src =>
                    src.AcademicTerm != null && src.AcademicYear != null
                        ? $"{src.AcademicTerm.Name}, năm học {src.AcademicYear.StartYear} - {src.AcademicYear.EndYear}"
                        : $"StudyPlan {src.Id}"
                )
                .Map(dest => dest.Status, src =>
                    DateTime.UtcNow >= src.StartDate && DateTime.UtcNow <= src.EndDate ? StudyPlanStatus.Active :
                    DateTime.UtcNow < src.StartDate ? StudyPlanStatus.Future : StudyPlanStatus.Past
                );
        }
    }
}

