using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class UserConfiguration: IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.FullName).HasMaxLength(100).IsRequired();
            builder.HasOne(u => u.StudentInfo)
                .WithOne(s => s.User)
                .HasForeignKey<StudentInfo>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
