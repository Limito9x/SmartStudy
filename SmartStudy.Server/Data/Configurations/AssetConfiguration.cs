using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class AssetConfiguration: IEntityTypeConfiguration<Asset>
    {
        public void Configure(EntityTypeBuilder<Asset> builder)
        {
            builder.ToTable("Assets");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.FileName)
                .IsRequired()
                .HasMaxLength(255);
            builder.Property(a => a.PublicId)
                .IsRequired()
                .HasMaxLength(500);
            builder.Property(a => a.Type)
                .IsRequired()
                .HasConversion<string>();
            builder.Property(a => a.Extension)
                .IsRequired()
                .HasMaxLength(10);
            builder.Property(a => a.FileSize)
                .IsRequired();
            builder.Property(a => a.CreatedAt)
                .IsRequired();
        }
    }
}
