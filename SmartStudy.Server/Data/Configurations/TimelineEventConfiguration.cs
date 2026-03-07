using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class TimelineEventConfiguration : IEntityTypeConfiguration<TimelineEvent>
    {
        public void Configure(EntityTypeBuilder<TimelineEvent> builder)
        {
            builder.Property(x => x.Title).HasMaxLength(300).IsRequired();
            builder.Property(x => x.DueDate).IsRequired();

            builder.HasOne(x => x.Course)
                .WithMany(c => c.TimelineEvents)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.CourseId, x.DueDate });
        }
    }
}

