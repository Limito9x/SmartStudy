using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class RoutineConfiguration: IEntityTypeConfiguration<Routine>
    {
        public void Configure(EntityTypeBuilder<Routine> builder)
        {
            builder.ToTable("Routines");
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(200);
            builder.HasIndex(r => new { r.Name, r.UserId })
                .IsUnique()
                .HasFilter("\"DeletedAt\" IS NULL");
            
        }
    }
}
