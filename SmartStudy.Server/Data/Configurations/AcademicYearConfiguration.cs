using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class AcademicYearConfiguration : IEntityTypeConfiguration<AcademicYear>
    {
        public void Configure(EntityTypeBuilder<AcademicYear> builder)
        {
            builder.Property(x => x.StartYear).IsRequired();
            builder.Property(x => x.EndYear).IsRequired();

            builder.HasIndex(x => new { x.StartYear, x.EndYear }).IsUnique();
        }
    }
}

