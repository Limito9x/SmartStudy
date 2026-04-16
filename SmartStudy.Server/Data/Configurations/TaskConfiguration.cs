using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class TaskConfiguration: IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.HasKey(t=> t.Id);
            builder.Property(t => t.Status)
                .HasConversion<string>();
            builder.Property(t => t.Type)
                .HasConversion<string>();
            builder.HasIndex(t => new
            {
                t.RoutineId,
                t.ScheduleId,
                t.StartDateTime
            }).IsUnique();

            builder.HasOne(t => t.Phase)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.PhaseId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
