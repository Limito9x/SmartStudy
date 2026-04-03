using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class EventStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "TimelineEvents");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "TimelineEvents",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "TimelineEvents");

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "TimelineEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
