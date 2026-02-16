using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class TaskConfiguration: IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.ToTable("Tasks");
            builder.HasKey(t=> t.Id);
            builder.Property(t => t.Status)
                .HasConversion<string>();
            builder.Property(t => t.Type)
                .HasConversion<string>();

        }
    }
}
