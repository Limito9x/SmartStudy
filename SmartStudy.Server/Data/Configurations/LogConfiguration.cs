using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class LogConfiguration : IEntityTypeConfiguration<LogItem>
    {
        public void Configure(EntityTypeBuilder<LogItem> builder)
        {
            builder.Property(l=>l.Note)
                .HasMaxLength(2000);
            
            // LogItem là dependent entity, TaskItem là principal entity
            builder.HasOne(l => l.Task)
                .WithOne(t => t.Log)
                .HasForeignKey<LogItem>(l => l.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
