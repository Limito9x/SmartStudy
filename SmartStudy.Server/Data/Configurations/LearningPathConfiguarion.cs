using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class LearningPathConfiguarion: IEntityTypeConfiguration<LearningPath>
    {
        public void Configure(EntityTypeBuilder<LearningPath> builder)
        {
            builder.Property(lp => lp.Status)
                .HasConversion<string>();
            builder.HasMany(lp => lp.SubGoals)
              .WithOne(g => g.LearningPath)
              .HasForeignKey(g => g.LearningPathId)
              .OnDelete(DeleteBehavior.Cascade); // Xóa Path thì xóa hết Goal con


            builder.HasOne(lp => lp.MainGoal)
                  .WithOne()
                  .HasForeignKey<LearningPath>(lp => lp.MainGoalId) // Khóa ngoại nằm ở LearningPath
                  .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
