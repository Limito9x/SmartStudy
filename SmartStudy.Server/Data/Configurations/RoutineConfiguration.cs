using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class RoutineConfiguration: IEntityTypeConfiguration<Routine>
    {
        public void Configure(EntityTypeBuilder<Routine> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(200);
            builder.HasIndex(r => new { r.Name, r.UserId })
                .IsUnique()
                .HasFilter("deleted_at IS NULL AND course_id IS NULL");
            
            builder.HasIndex(r => new { r.Name, r.CourseId })
                .IsUnique()
                .HasFilter("deleted_at IS NULL AND course_id IS NOT NULL");

            builder.HasMany(r => r.Schedules)
                .WithOne(s => s.Routine)
                .HasForeignKey(s => s.RoutineId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
