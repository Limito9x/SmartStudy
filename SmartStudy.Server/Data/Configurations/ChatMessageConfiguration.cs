using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class ChatMessageConfiguration: IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.HasKey(cm => cm.Id);
            builder.Property(cm => cm.Content)
                .IsRequired();
            builder.HasOne(cm => cm.Session)
                .WithMany()
                .HasForeignKey(cm => cm.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Property(cm => cm.Data)
                .HasColumnType("jsonb");
        }
    }
}
