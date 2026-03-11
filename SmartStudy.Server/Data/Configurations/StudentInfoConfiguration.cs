using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class StudentInfoConfiguration : IEntityTypeConfiguration<StudentInfo>
    {
        public void Configure(EntityTypeBuilder<StudentInfo> builder)
        {
            // 1. Chốt hạ UserId chính là Khóa chính (Primary Key)
            builder.HasKey(s => s.UserId);

            // 2. Tùy chọn thêm: Cấu hình giới hạn độ dài cho các trường text để DB tối ưu hơn
            builder.Property(s => s.University).HasMaxLength(200);
            builder.Property(s => s.Major).HasMaxLength(150);
            builder.Property(s => s.Cohort).HasMaxLength(50);
        }
    }
}