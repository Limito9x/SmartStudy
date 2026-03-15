using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class StudyPlanConfiguration : IEntityTypeConfiguration<StudyPlan>
    {
        public void Configure(EntityTypeBuilder<StudyPlan> builder)
        {
            builder.HasOne(c => c.User)
                .WithMany(u => u.StudyPlans)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
        }
    }
}

