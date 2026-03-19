using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartStudy.Server.Entities;

namespace SmartStudy.Server.Data.Configurations;

public class PlanTemplateConfiguration : IEntityTypeConfiguration<PlanTemplate>
{
    public void Configure(EntityTypeBuilder<PlanTemplate> builder)
    {
        builder.ToTable("PlanTemplates");

        // Template → SourcePlan
        builder.HasOne(t => t.SourcePlan)
            .WithMany()
            .HasForeignKey(t => t.SourcePlanId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(t => t.Payload)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions.Default),
                v => JsonSerializer.Deserialize<TemplatePayload>(
                    v, JsonSerializerOptions.Default)!
            );
    }
}