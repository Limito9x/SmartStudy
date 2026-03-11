using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class CourseChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysOfMonth",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "Interval",
                table: "Schedules");

            migrationBuilder.AddColumn<string>(
                name: "AlternativeName",
                table: "Routines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mentor",
                table: "Routines",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlternativeName",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "Mentor",
                table: "Routines");

            migrationBuilder.AddColumn<int[]>(
                name: "DaysOfMonth",
                table: "Schedules",
                type: "integer[]",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Frequency",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Interval",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
