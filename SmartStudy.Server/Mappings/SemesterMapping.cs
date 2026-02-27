using Mapster;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Mappings
{
    // Mapster registration for Semester mappings
    public class SemesterMapping : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Map RequestSemesterDto -> Entities.Semester
            config.NewConfig<RequestSemesterDto, Semester>()
                // Ensure Name is generated from Term (as integer) and Year
                .Map(dest => dest.Name, src => $"Học kỳ {(int)src.Term}, năm học {src.Year} - {src.Year + 1}")
                // Don't overwrite database Id when mapping onto existing entity
                .Ignore(dest => dest.Id)
                // Ignore null values coming from DTO so existing entity fields are preserved
                .IgnoreNullValues(true);
            config.NewConfig<Semester, ResponseSemesterDto>()
                .Map(dest => dest.Status, src =>
                    DateTime.UtcNow >= src.StartDate && DateTime.UtcNow <= src.EndDate ? SemesterStatus.Active :
                    DateTime.UtcNow < src.StartDate ? SemesterStatus.Future : SemesterStatus.Past
                );
        }
    }
}
