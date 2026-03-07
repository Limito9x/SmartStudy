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

            builder.HasOne(c => c.Subject)
                .WithMany()
                .HasForeignKey(c => c.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(c => new { c.StudyPlanId, c.SubjectId });
        }
    }
}