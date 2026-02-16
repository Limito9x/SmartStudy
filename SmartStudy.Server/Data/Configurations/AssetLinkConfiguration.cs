using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations
{
    public class AssetLinkConfiguration: IEntityTypeConfiguration<AssetLink>
    {
        public void Configure(EntityTypeBuilder<AssetLink> builder)
        {
            builder.ToTable("AssetLinks");
            builder.HasKey(al => al.Id);
            builder.Property(al => al.Category)
                .HasConversion<string>();
            builder.Property(al => al.LinkedType)
                .HasConversion<string>();
            builder.HasOne(al => al.Asset)
                .WithMany(a => a.AssetLinks)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
