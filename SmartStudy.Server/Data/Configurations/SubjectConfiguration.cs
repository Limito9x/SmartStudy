using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            builder.Property(x => x.Name).HasMaxLength(300).IsRequired();

            builder.HasIndex(x => new
            {
                Name = x.Name,
                Type = x.Type,
                UserId = x.UserId
            }).IsUnique()
            .HasFilter("\"DeletedAt\" IS NULL");
        }
    }
}

