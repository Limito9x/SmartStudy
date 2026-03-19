using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class PlanTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "StudyPlans",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PlanTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedById = table.Column<int>(type: "integer", nullable: true),
                    Payload = table.Column<string>(type: "jsonb", nullable: false),
                    SourcePlanId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanTemplates_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PlanTemplates_StudyPlans_SourcePlanId",
                        column: x => x.SourcePlanId,
                        principalTable: "StudyPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_TemplateId",
                table: "StudyPlans",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTemplates_CreatedById",
                table: "PlanTemplates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PlanTemplates_SourcePlanId",
                table: "PlanTemplates",
                column: "SourcePlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_StudyPlans_PlanTemplates_TemplateId",
                table: "StudyPlans",
                column: "TemplateId",
                principalTable: "PlanTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudyPlans_PlanTemplates_TemplateId",
                table: "StudyPlans");

            migrationBuilder.DropTable(
                name: "PlanTemplates");

            migrationBuilder.DropIndex(
                name: "IX_StudyPlans_TemplateId",
                table: "StudyPlans");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "StudyPlans");
        }
    }
}
