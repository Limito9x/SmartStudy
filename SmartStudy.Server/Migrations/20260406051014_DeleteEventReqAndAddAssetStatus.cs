using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class DeleteEventReqAndAddAssetStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_EventRequirements_EventRequirementId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "EventRequirements");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_EventRequirementId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "EventRequirementId",
                table: "Tasks");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Assets",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Assets");

            migrationBuilder.AddColumn<int>(
                name: "EventRequirementId",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventRequirements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TimelineEventId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ExpectedValue = table.Column<float>(type: "real", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Strategy = table.Column<int>(type: "integer", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRequirements_TimelineEvents_TimelineEventId",
                        column: x => x.TimelineEventId,
                        principalTable: "TimelineEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_EventRequirementId",
                table: "Tasks",
                column: "EventRequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRequirements_TimelineEventId",
                table: "EventRequirements",
                column: "TimelineEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_EventRequirements_EventRequirementId",
                table: "Tasks",
                column: "EventRequirementId",
                principalTable: "EventRequirements",
                principalColumn: "Id");
        }
    }
}
