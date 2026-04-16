using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.HasOne(c => c.StudyPlan)
                .WithMany(s => s.Courses)
                .HasForeignKey(c => c.StudyPlanId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(c => c.Phases)
                .WithOne(p => p.Course)
                .HasForeignKey(p => p.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(c => new { c.Name, c.StudyPlanId })
                .IsUnique()
                .HasFilter("deleted_at IS NULL");
            
            builder.HasIndex(c => new { c.SubjectId, c.StudyPlanId })
                .IsUnique()
                .HasFilter("subject_id IS NOT NULL AND deleted_at IS NULL");
        }
    }
}